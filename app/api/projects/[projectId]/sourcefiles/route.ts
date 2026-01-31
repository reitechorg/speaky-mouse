import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(
	req: NextRequest,
	ctx: RouteContext<'/api/projects/[projectId]/sourcefiles'>,
) {
	const headers = await req.headers;
	const { projectId } = await ctx.params;
	const authHeader = headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized', { status: 401 });
	}

	const token = authHeader.substring(7);

	const data = await db.projectApiKey.findUnique({
		where: {
			key: token,
		},
		include: {
			project: {
				include: {
					sourceFiles: true,
				},
			},
		},
	});

	if (!data) {
		return new Response('Unauthorized', { status: 401 });
	}

	if (data.project.id !== projectId) {
		return new Response('Forbidden', { status: 403 });
	}

	return Response.json(data.project.sourceFiles);
}
