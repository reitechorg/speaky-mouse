import { ProjectApiKey } from '../generated/prisma/client';
import { NextRequest } from 'next/server';

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns the token string, or a Response with an error if missing/malformed.
 */
export function extractBearerToken(
	req: NextRequest,
): { token: string } | Response {
	const authHeader = req.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
	return { token: authHeader.substring(7) };
}

/**
 * Validates that the given token matches one of the project's API keys and
 * (optionally) has write access. Returns the matching key, or a Response with
 * an appropriate error status.
 */
export function validateApiKeyAccess(
	apiKeys: ProjectApiKey[],
	token: string,
	requireWrite = false,
): { key: ProjectApiKey } | Response {
	const key = apiKeys.find((k) => k.key === token);
	if (!key) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
	if (requireWrite && key.access === 'READ_ONLY') {
		return Response.json(
			{ error: 'Forbidden: read-only token' },
			{ status: 403 },
		);
	}
	return { key };
}
