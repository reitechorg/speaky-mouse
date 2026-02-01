import { db } from '@/lib/db';
import { FileParser, getFileHandler } from '@/lib/file-handlers/get-handler';
import { NextRequest } from 'next/server';

export async function GET(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]/export'>,
) {
	const headers = await req.headers;
	const { sourceFileId } = await ctx.params;
	const authHeader = headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized', { status: 401 });
	}

	const token = authHeader.substring(7);
	const data = await db.sourceFile.findUnique({
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

	if (!data) {
		return new Response('Source file not found', { status: 404 });
	}

	const projectApiKeys = data.project.apiKeys || [];
	const validToken = projectApiKeys.find((key) => key.key === token);

	if (!validToken) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (!data.parser) {
		return new Response('Source file parser not defined', { status: 400 });
	}

	const parser = getFileHandler(data.parser as FileParser);

	const exportedContent = await parser.export(
		data,
		data.targetLanguages.map((lang) => lang.language),
	);

	return Response.json({ files: exportedContent }, { status: 200 });
}
