import { db } from '@/lib/db';
import { sourceFileInputSchema } from '@/lib/schema/sourceFileSchema';
import { NextRequest } from 'next/server';

const bodySchema = sourceFileInputSchema
	.omit({
		projectId: true,
	})
	.partial();

export async function POST(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]'>,
) {
	const headers = await req.headers;
	const { sourceFileId } = await ctx.params;
	const authHeader = headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized', { status: 401 });
	}
	const token = authHeader.substring(7);
	const body = await req.json();
	const parsedBody = bodySchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json(parsedBody.error, { status: 400 });
	}

	const oldSourceFileData = await db.sourceFile.findUnique({
		where: {
			id: sourceFileId,
		},
		include: {
			project: {
				include: {
					apiKeys: true,
				},
			},
			targetLanguages: true,
		},
	});

	if (!oldSourceFileData) {
		return new Response('Source file not found', { status: 404 });
	}

	const projectApiKeys = oldSourceFileData.project.apiKeys || [];
	const validToken = projectApiKeys.find((key) => key.key === token);

	if (!validToken) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (validToken.access === 'READ_ONLY') {
		return new Response('Forbidden: Read-only access', { status: 403 });
	}

	const oldTargetLanguages = oldSourceFileData.targetLanguages.map(
		(lang) => lang.language,
	);
	const targetLanguages =
		parsedBody.data.targetLanguages || oldTargetLanguages;
	const targetLanguagesToAdd = targetLanguages.filter(
		(lang) => !oldTargetLanguages.includes(lang),
	);

	const updatedFile = await db.sourceFile.update({
		where: {
			id: oldSourceFileData.id,
		},
		data: {
			exportPath:
				parsedBody.data.exportPath || oldSourceFileData.exportPath,
			importPath:
				parsedBody.data.importPath || oldSourceFileData.importPath,
			notTranslatedStringExportMode:
				parsedBody.data.notTranslatedStringExportMode ||
				oldSourceFileData.notTranslatedStringExportMode,
			parser: parsedBody.data.parser || oldSourceFileData.parser,
			title: parsedBody.data.title || oldSourceFileData.title,
			sourceLanguage:
				parsedBody.data.sourceLanguage ||
				oldSourceFileData.sourceLanguage,
			targetLanguages: {
				deleteMany: {
					language: {
						notIn: targetLanguages,
					},
					sourceFileId: oldSourceFileData.id,
				},
				createMany: {
					skipDuplicates: true,
					data: targetLanguagesToAdd.map((language) => ({
						language,
					})),
				},
			},
		},
		include: {
			targetLanguages: true,
		},
	});

	return Response.json(
		{ message: 'File updated successfully', file: updatedFile },
		{ status: 200 },
	);
}
