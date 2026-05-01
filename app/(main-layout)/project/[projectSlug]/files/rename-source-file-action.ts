'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/permissions/check';
import { revalidatePath } from 'next/cache';

type RenameState = { error: string | null; success?: boolean };

export async function renameSourceFileAction(
	prevState: RenameState,
	formData: FormData,
): Promise<RenameState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const fileId = `${formData.get('fileId')}`.trim();
	const title = `${formData.get('title')}`.trim();
	const projectSlug = `${formData.get('projectSlug')}`.trim();

	if (title.length < 1) return { error: 'TITLE_TOO_SHORT' };

	const sourceFile = await db.sourceFile.findUnique({
		where: { id: fileId },
		include: { project: { include: { members: true } } },
	});

	if (!sourceFile) return { error: 'FILE_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'sourceFile', 'update', {
			projectMembers: sourceFile.project.members,
			sourceFile,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const existing = await db.sourceFile.findFirst({
		where: { projectId: sourceFile.projectId, title, NOT: { id: fileId } },
	});
	if (existing) return { error: 'TITLE_ALREADY_EXISTS' };

	await db.sourceFile.update({ where: { id: fileId }, data: { title } });

	revalidatePath(`/project/${projectSlug}/files`);
	return { error: null, success: true };
}
