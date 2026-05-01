import { extractBearerToken, validateApiKeyAccess } from '@/lib/api/validate-token';
import { db } from '@/lib/db';
import { getFileHandler } from '@/lib/file-handlers/get-handler';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { NextRequest } from 'next/server';

export async function GET(
	req: NextRequest,
	ctx: RouteContext<'/api/sourcefiles/[sourceFileId]/export'>,
) {
	const tokenResult = extractBearerToken(req);
	if (tokenResult instanceof Response) return tokenResult;
	const { token } = tokenResult;

	const { sourceFileId } = await ctx.params;
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
		return Response.json({ error: 'Source file not found' }, { status: 404 });
	}

	const authResult = validateApiKeyAccess(data.project.apiKeys, token);
	if (authResult instanceof Response) return authResult;

	if (!data.parser) {
		return Response.json({ error: 'Source file parser not defined' }, { status: 400 });
	}

	const parser = getFileHandler(data.parser as FileParser);

	const exportedContent = await parser.export(
		data,
		data.targetLanguages.map((lang) => lang.language),
	);

	return Response.json({ files: exportedContent }, { status: 200 });
}
