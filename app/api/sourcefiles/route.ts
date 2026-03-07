import { db } from '@/lib/db';
import { sourceFileInputSchema } from '@/lib/schema/sourceFileSchema';
import { NextRequest } from 'next/server';
import { title } from 'process';

export async function POST(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles'>,
) {
	const headers = await req.headers;
	const authHeader = headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized', { status: 401 });
	}

	const token = authHeader.substring(7);

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
		return new Response('Project not found', { status: 404 });
	}

	const projectApiKeys = projectData.apiKeys || [];
	const validToken = projectApiKeys.find((key) => key.key === token);

	if (!validToken) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (validToken.access === 'READ_ONLY') {
		return new Response('Forbidden: Read-only access', { status: 403 });
	}

	const fileAlreadyExists = projectData.sourceFiles.some(
		({ title }) => title === parsedBody.data.title,
	);

	if (fileAlreadyExists) {
		return new Response(
			'Source file with this title already exists in this project',
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
