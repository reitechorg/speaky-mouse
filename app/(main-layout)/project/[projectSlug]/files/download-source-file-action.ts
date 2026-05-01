'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFileHandler } from '@/lib/file-handlers/get-handler';
import { checkPermission } from '@/lib/permissions/check';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { OutputFile } from '@/lib/file-handler';

type DownloadResult =
	| { error: string }
	| { files: OutputFile[] };

export async function downloadSourceFileAction(
	fileId: string,
	language: string,
): Promise<DownloadResult> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const sourceFile = await db.sourceFile.findUnique({
		where: { id: fileId },
		include: { project: { include: { members: true } } },
	});

	if (!sourceFile) return { error: 'FILE_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'sourceFile', 'export', {
			projectMembers: sourceFile.project.members,
			sourceFile,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	if (!sourceFile.parser) return { error: 'PARSER_NOT_DEFINED' };

	const handler = getFileHandler(sourceFile.parser as FileParser);

	try {
		const files = await handler.export(sourceFile, [language]);
		return { files };
	} catch (e) {
		return { error: e instanceof Error ? e.message : 'EXPORT_FAILED' };
	}
}
