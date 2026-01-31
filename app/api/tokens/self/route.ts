import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(
	req: NextRequest,
	// ctx: RouteContext<'/api/tokens/self'>,
) {
	const headers = await req.headers;
	const authHeader = headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized', { status: 401 });
	}

	const token = authHeader.substring(7); // Remove 'Bearer ' prefix

	const tokenData = await db.projectApiKey.findUnique({
		where: {
			key: token,
		},
		include: {
			project: true,
		},
	});

	if (!tokenData) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	return Response.json({
		key: tokenData.key,
		access: tokenData.access,
		project: {
			id: tokenData.project.id,
			slug: tokenData.project.slug,
			title: tokenData.project.title,
		},
	});
}
