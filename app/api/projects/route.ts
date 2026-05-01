import { extractBearerToken } from '@/lib/api/validate-token';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	const tokenResult = extractBearerToken(req);
	if (tokenResult instanceof Response) return tokenResult;
	const { token } = tokenResult;

	const keyData = await db.projectApiKey.findUnique({
		where: { key: token },
		include: {
			project: {
				include: { defaultTargetLanguages: true },
			},
		},
	});

	if (!keyData) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { project } = keyData;
	return Response.json([
		{
			id: project.id,
			slug: project.slug,
			title: project.title,
			description: project.description,
			defaultSourceLanguage: project.defaultSourceLanguage,
			defaultTargetLanguages: project.defaultTargetLanguages.map((l) => l.language),
		},
	]);
}
