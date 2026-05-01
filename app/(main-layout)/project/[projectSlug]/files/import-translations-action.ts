'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFileHandler } from '@/lib/file-handlers/get-handler';
import { checkPermission } from '@/lib/permissions/check';
import { TranslationConflictMode } from '@/lib/file-handler';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { langCodes } from '@/lib/lang-codes';

type ImportTranslationsState = {
	error: string | null;
	success?: boolean;
	result?: { imported: number; skipped: number; notFound: number };
};

export async function importTranslationsAction(
	prevState: ImportTranslationsState,
	formData: FormData,
): Promise<ImportTranslationsState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const fileId = `${formData.get('fileId')}`.trim();
	const language = `${formData.get('language')}`.trim();
	const conflictMode = `${formData.get('conflictMode')}`.trim() as TranslationConflictMode;
	const autoApprove = formData.get('autoApprove') === 'on';
	const file = formData.get('file') as File | null;

	const validConflictModes: TranslationConflictMode[] = ['OVERWRITE', 'SKIP_EXISTING', 'SKIP_APPROVED'];
	if (!validConflictModes.includes(conflictMode)) {
		return { error: 'INVALID_CONFLICT_MODE' };
	}

	if (language.length !== 2 || !Object.keys(langCodes).includes(language)) {
		return { error: 'INVALID_LANGUAGE' };
	}

	if (!file || file.size === 0) return { error: 'NO_FILE_PROVIDED' };

	const sourceFile = await db.sourceFile.findUnique({
		where: { id: fileId },
		include: { project: { include: { members: true } } },
	});

	if (!sourceFile) return { error: 'FILE_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'sourceFile', 'import', {
			projectMembers: sourceFile.project.members,
			sourceFile,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	if (!sourceFile.parser) return { error: 'PARSER_NOT_DEFINED' };

	const handler = getFileHandler(sourceFile.parser as FileParser);
	const fileContent = await file.text();

	try {
		const result = await handler.importTranslations(sourceFile, fileContent, {
			language,
			conflictMode,
			autoApprove,
			userId: user.user.id,
		});
		return { error: null, success: true, result };
	} catch (e) {
		return { error: e instanceof Error ? e.message : 'IMPORT_FAILED' };
	}
}
