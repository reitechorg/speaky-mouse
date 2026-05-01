import { extractBearerToken, validateApiKeyAccess } from '@/lib/api/validate-token';
import { db } from '@/lib/db';
import { sourceFileInputSchema } from '@/lib/schema/sourceFileSchema';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
	const tokenResult = extractBearerToken(req);
	if (tokenResult instanceof Response) return tokenResult;
	const { token } = tokenResult;

	const body = await req.json();
	const parsedBody = sourceFileInputSchema.safeParse(body);
	if (!parsedBody.success) {
		return Response.json(parsedBody.error, { status: 400 });
	}

	const projectData = await db.project.findUnique({
		where: {
			id: parsedBody.data.projectId,
		},
		include: {
			apiKeys: true,
			sourceFiles: true,
			defaultTargetLanguages: true,
		},
	});

	if (!projectData) {
		return Response.json({ error: 'Project not found' }, { status: 404 });
	}

	const authResult = validateApiKeyAccess(projectData.apiKeys, token, true);
	if (authResult instanceof Response) return authResult;

	const fileAlreadyExists = projectData.sourceFiles.some(
		({ title }) => title === parsedBody.data.title,
	);

	if (fileAlreadyExists) {
		return Response.json(
			{ error: 'Source file with this title already exists in this project' },
			{ status: 400 },
		);
	}

	const sourceLanguage =
		parsedBody.data.sourceLanguage || projectData.defaultSourceLanguage;
	const defaultTargetLanguages = projectData.defaultTargetLanguages.map(
		(lang) => lang.language,
	);
	const targetLanguages =
		parsedBody.data.targetLanguages || defaultTargetLanguages;

	const newSourceFile = await db.sourceFile.create({
		data: {
			exportPath: parsedBody.data.exportPath,
			importPath: parsedBody.data.importPath,
			sourceLanguage: sourceLanguage,
			title: parsedBody.data.title,
			notTranslatedStringExportMode:
				parsedBody.data.notTranslatedStringExportMode,
			parser: parsedBody.data.parser,
			projectId: projectData.id,
			targetLanguages: {
				createMany: {
					skipDuplicates: true,
					data: targetLanguages.map((lang) => ({
						language: lang,
					})),
				},
			},
		},
		include: {
			targetLanguages: true,
		},
	});

	return Response.json(
		{ message: 'File created successfully', file: newSourceFile },
		{ status: 200 },
	);
}
