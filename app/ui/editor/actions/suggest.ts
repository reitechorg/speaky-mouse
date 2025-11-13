'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { refresh } from 'next/cache';

export async function SuggestStringAction(formData: FormData) {
	'use server';

	const user = await getUser();
	if (!user || !user.user) {
		throw new Error('User not authenticated');
	}

	const content = formData.get('content') as string;
	const localeStringId = formData.get('locale-string-id') as string;
	const language = formData.get('language') as string;

	// TODO: Validation

	const membership = await db.projectMember.findFirst({
		where: {
			userId: user.user.id,
			project: {
				sourceFiles: {
					some: {
						localeStrings: {
							some: {
								id: localeStringId,
							},
						},
					},
				},
			},
		},
	});

	if (!membership) {
		throw new Error('User is not a member of the project');
	}

	if (membership.role === 'BANNED') {
		throw new Error('User is banned from this project');
	}

	await db.translation.create({
		data: {
			content: content,
			language: language,
			localeStringId: localeStringId,
			authorId: user.user.id,
		},
	});

	refresh();
}

export async function DeleteTranslations(formData: FormData) {
	'use server';

	const user = await getUser();
	if (!user || !user.user) {
		throw new Error('User not authenticated');
	}

	const translationId = formData.get('translation-id') as string;

	const translation = await db.translation.findUnique({
		where: {
			id: translationId,
		},
		include: {
			localeString: {
				include: {
					sourceFile: {
						include: {
							project: {
								include: {
									members: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!translation) {
		throw new Error('Translation not found');
	}

	const membership = translation.localeString.sourceFile.project.members.find(
		(m) => m.userId === user.user.id,
	);

	if (
		!membership ||
		membership.role === 'BANNED' ||
		(membership.role === 'TRANSLATOR' &&
			user.user.id !== translation.authorId)
	) {
		throw new Error('User is not authorized to delete this translation');
	}

	await db.translation.delete({
		where: {
			id: translationId,
		},
	});

	refresh();
}

export async function ApproveTranslation(formData: FormData) {
	'use server';

	const user = await getUser();
	if (!user || !user.user) {
		throw new Error('User not authenticated');
	}

	const translationId = formData.get('translation-id') as string;

	const translation = await db.translation.findUnique({
		where: {
			id: translationId,
		},
		include: {
			localeString: {
				include: {
					sourceFile: {
						include: {
							project: {
								include: {
									members: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!translation) {
		throw new Error('Translation not found');
	}

	const membership = translation.localeString.sourceFile.project.members.find(
		(m) => m.userId === user.user.id,
	);

	if (
		!membership ||
		membership.role === 'BANNED' ||
		membership.role === 'TRANSLATOR'
	) {
		throw new Error('User is not authorized to approve this translation');
	}

	await db.$transaction([
		db.translation.updateMany({
			where: {
				localeStringId: translation.localeStringId,
				approvedAt: {
					not: null,
				},
			},
			data: {
				approvedBy: null,
				approvedAt: null,
			},
		}),
		db.translation.update({
			where: {
				id: translationId,
			},
			data: {
				approvedBy: user.user.id,
				approvedAt: new Date(),
			},
		}),
	]);

	refresh();
}
