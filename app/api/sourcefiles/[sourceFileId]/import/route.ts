import { db } from '@/lib/db';
import { getFileHandler } from '@/lib/file-handlers/get-handler';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { NextRequest } from 'next/server';

export async function POST(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]/import'>,
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

	if (validToken.access === 'READ_ONLY') {
		return new Response('Forbidden: Read-only access', { status: 403 });
	}

	if (!data.parser) {
		return new Response('Source file parser not defined', { status: 400 });
	}

	const parser = getFileHandler(data.parser as FileParser);

	const { content } = await req.json();
	await parser.import(data, content);

	return Response.json(
		{ message: 'File imported successfully' },
		{ status: 200 },
	);
}
