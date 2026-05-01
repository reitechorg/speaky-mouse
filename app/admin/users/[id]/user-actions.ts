'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

type ActionState = { error: string | null; success?: boolean };

export async function updateUserRoleAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const currentUser = await getUser();
	if (!currentUser || currentUser.user.role !== 'admin') {
		return { error: 'UNAUTHORIZED' };
	}

	const userId = `${formData.get('userId')}`.trim();
	const role = `${formData.get('role')}`.trim();

	if (!['user', 'admin'].includes(role)) {
		return { error: 'INVALID_ROLE' };
	}

	if (userId === currentUser.user.id) {
		return { error: 'CANNOT_CHANGE_OWN_ROLE' };
	}

	await db.user.update({
		where: { id: userId },
		data: { role },
	});

	revalidatePath(`/admin/users/${userId}`);
	return { error: null, success: true };
}

export async function updateUserBanAction(
	prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const currentUser = await getUser();
	if (!currentUser || currentUser.user.role !== 'admin') {
		return { error: 'UNAUTHORIZED' };
	}

	const userId = `${formData.get('userId')}`.trim();
	const action = `${formData.get('action')}`.trim();

	if (userId === currentUser.user.id) {
		return { error: 'CANNOT_BAN_YOURSELF' };
	}

	if (action === 'ban') {
		const banReason = `${formData.get('banReason')}`.trim() || null;
		const banExpiresRaw = `${formData.get('banExpires')}`.trim();
		const banExpires = banExpiresRaw ? new Date(banExpiresRaw) : null;

		await db.user.update({
			where: { id: userId },
			data: {
				banned: true,
				banReason,
				banExpires,
			},
		});
	} else if (action === 'unban') {
		await db.user.update({
			where: { id: userId },
			data: {
				banned: false,
				banReason: null,
				banExpires: null,
			},
		});
	} else {
		return { error: 'INVALID_ACTION' };
	}

	revalidatePath(`/admin/users/${userId}`);
	return { error: null, success: true };
}
