'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { langCodes } from '@/lib/lang-codes';
import { checkPermission } from '@/lib/permissions/check';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type ActionState = { error: string | null; success?: boolean };

async function getProjectWithMembers(slug: string) {
	return db.project.findUnique({
		where: { slug },
		include: { members: true },
	});
}

export async function updateProjectAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const slug = `${formData.get('slug')}`.trim();
	const project = await getProjectWithMembers(slug);
	if (!project) return { error: 'PROJECT_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'project', 'update', {
			project,
			projectMembers: project.members,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const title = `${formData.get('title')}`.trim();
	const description = `${formData.get('description')}`.trim();
	const imageUrl = `${formData.get('imageUrl')}`.trim();
	const publicVisible = formData.get('publicVisible') === 'on';
	const publicJoin = formData.get('publicJoin') === 'on';
	const publicDownload = formData.get('publicDownload') === 'on';
	const defaultSourceLanguage = `${formData.get('defaultSourceLanguage')}`.trim();

	if (title.length < 1) return { error: 'TITLE_TOO_SHORT' };
	if (title.length > 100) return { error: 'TITLE_TOO_LONG' };
	if (description.length > 500) return { error: 'DESCRIPTION_TOO_LONG' };

	if (
		defaultSourceLanguage.length !== 2 ||
		!Object.keys(langCodes).includes(defaultSourceLanguage)
	) {
		return { error: 'INVALID_SOURCE_LANGUAGE' };
	}

	const targetLanguagesRaw = formData.getAll('targetLanguages') as string[];
	const targetLanguages = targetLanguagesRaw.filter(
		(lang) => lang.length === 2 && Object.keys(langCodes).includes(lang),
	);

	await db.$transaction([
		db.project.update({
			where: { id: project.id },
			data: {
				title,
				description: description || null,
				imageUrl: imageUrl || null,
				publicVisible,
				publicJoin,
				publicDownload,
				defaultSourceLanguage,
			},
		}),
		db.defaultProjectTargetLanguage.deleteMany({
			where: { projectId: project.id },
		}),
		db.defaultProjectTargetLanguage.createMany({
			data: targetLanguages.map((lang) => ({
				projectId: project.id,
				language: lang,
			})),
			skipDuplicates: true,
		}),
	]);

	revalidatePath(`/project/${slug}/settings`);
	return { error: null, success: true };
}

export async function updateMemberRoleAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const slug = `${formData.get('slug')}`.trim();
	const targetUserId = `${formData.get('userId')}`.trim();
	const role = `${formData.get('role')}`.trim();

	const validRoles = ['TRANSLATOR', 'REVIEWER', 'MODERATOR', 'ADMIN'];
	if (!validRoles.includes(role)) return { error: 'INVALID_ROLE' };

	const project = await getProjectWithMembers(slug);
	if (!project) return { error: 'PROJECT_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'project', 'manageMembers', {
			project,
			projectMembers: project.members,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const callerMembership = project.members.find(
		(m) => m.userId === user.user.id,
	);
	const targetMembership = project.members.find(
		(m) => m.userId === targetUserId,
	);

	if (!targetMembership) return { error: 'MEMBER_NOT_FOUND' };
	if (targetMembership.role === 'OWNER') return { error: 'CANNOT_CHANGE_OWNER' };
	if (
		callerMembership?.role !== 'OWNER' &&
		callerMembership?.role !== 'ADMIN'
	) {
		return { error: 'UNAUTHORIZED' };
	}

	await db.projectMember.update({
		where: { projectId_userId: { projectId: project.id, userId: targetUserId } },
		data: { role: role as never },
	});

	revalidatePath(`/project/${slug}/settings`);
	return { error: null, success: true };
}

export async function removeMemberAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const slug = `${formData.get('slug')}`.trim();
	const targetUserId = `${formData.get('userId')}`.trim();

	const project = await getProjectWithMembers(slug);
	if (!project) return { error: 'PROJECT_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'project', 'manageMembers', {
			project,
			projectMembers: project.members,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const targetMembership = project.members.find(
		(m) => m.userId === targetUserId,
	);
	if (!targetMembership) return { error: 'MEMBER_NOT_FOUND' };
	if (targetMembership.role === 'OWNER') return { error: 'CANNOT_REMOVE_OWNER' };

	await db.projectMember.delete({
		where: { projectId_userId: { projectId: project.id, userId: targetUserId } },
	});

	revalidatePath(`/project/${slug}/settings`);
	return { error: null, success: true };
}

export async function addMemberAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const slug = `${formData.get('slug')}`.trim();
	const email = `${formData.get('email')}`.trim().toLowerCase();
	const role = `${formData.get('role')}`.trim();

	const validRoles = ['TRANSLATOR', 'REVIEWER', 'MODERATOR', 'ADMIN'];
	if (!validRoles.includes(role)) return { error: 'INVALID_ROLE' };

	const project = await getProjectWithMembers(slug);
	if (!project) return { error: 'PROJECT_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'project', 'manageMembers', {
			project,
			projectMembers: project.members,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const targetUser = await db.user.findFirst({
		where: { email: { equals: email } },
	});
	if (!targetUser) return { error: 'USER_NOT_FOUND' };

	const alreadyMember = project.members.some(
		(m) => m.userId === targetUser.id,
	);
	if (alreadyMember) return { error: 'ALREADY_MEMBER' };

	await db.projectMember.create({
		data: {
			projectId: project.id,
			userId: targetUser.id,
			role: role as never,
		},
	});

	revalidatePath(`/project/${slug}/settings`);
	return { error: null, success: true };
}

export async function deleteProjectAction(slug: string): Promise<void> {
	const user = await getUser();
	if (!user) return;

	const project = await getProjectWithMembers(slug);
	if (!project) return;

	if (
		!checkPermission(user.user, 'project', 'delete', {
			project,
			projectMembers: project.members,
		})
	) {
		return;
	}

	await db.project.delete({ where: { id: project.id } });
	redirect('/');
}
