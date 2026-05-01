import { extractBearerToken, validateApiKeyAccess } from '@/lib/api/validate-token';
import { db } from '@/lib/db';
import { sourceFileInputSchema } from '@/lib/schema/sourceFileSchema';
import { NextRequest } from 'next/server';

const bodySchema = sourceFileInputSchema
	.omit({
		projectId: true,
	})
	.partial();

async function getSourceFileWithAuth(
	req: NextRequest,
	sourceFileId: string,
	requireWrite = false,
) {
	const tokenResult = extractBearerToken(req);
	if (tokenResult instanceof Response) return tokenResult;
	const { token } = tokenResult;

	const sourceFile = await db.sourceFile.findUnique({
		where: { id: sourceFileId },
		include: {
			project: { include: { apiKeys: true } },
			targetLanguages: true,
		},
	});

	if (!sourceFile) {
		return Response.json({ error: 'Source file not found' }, { status: 404 });
	}

	const authResult = validateApiKeyAccess(sourceFile.project.apiKeys, token, requireWrite);
	if (authResult instanceof Response) return authResult;

	return { sourceFile };
}

export async function GET(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]'>,
) {
	const { sourceFileId } = await ctx.params;
	const result = await getSourceFileWithAuth(req, sourceFileId, false);
	if (result instanceof Response) return result;

	const { sourceFile } = result;
	return Response.json({
		id: sourceFile.id,
		title: sourceFile.title,
		importPath: sourceFile.importPath,
		exportPath: sourceFile.exportPath,
		parser: sourceFile.parser,
		sourceLanguage: sourceFile.sourceLanguage,
		targetLanguages: sourceFile.targetLanguages.map((l) => l.language),
		notTranslatedStringExportMode: sourceFile.notTranslatedStringExportMode,
		projectId: sourceFile.projectId,
	});
}

export async function DELETE(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]'>,
) {
	const { sourceFileId } = await ctx.params;
	const result = await getSourceFileWithAuth(req, sourceFileId, true);
	if (result instanceof Response) return result;

	await db.sourceFile.delete({ where: { id: sourceFileId } });

	return Response.json({ message: 'Source file deleted successfully' });
}

export async function POST(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]'>,
) {
	const tokenResult = extractBearerToken(req);
	if (tokenResult instanceof Response) return tokenResult;
	const { token } = tokenResult;

	const { sourceFileId } = await ctx.params;
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
		return Response.json({ error: 'Source file not found' }, { status: 404 });
	}

	const authResult = validateApiKeyAccess(oldSourceFileData.project.apiKeys, token, true);
	if (authResult instanceof Response) return authResult;

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
