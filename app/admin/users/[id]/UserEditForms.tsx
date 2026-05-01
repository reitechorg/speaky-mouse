'use client';

import { useActionState } from 'react';
import { updateUserRoleAction, updateUserBanAction } from './user-actions';
import { useExtracted } from 'next-intl';

type Props = {
	userId: string;
	currentRole: string;
	isBanned: boolean;
	banReason: string | null;
};

export function UserRoleForm({ userId, currentRole }: Pick<Props, 'userId' | 'currentRole'>) {
	const t = useExtracted();
	const [state, formAction, pending] = useActionState(updateUserRoleAction, {
		error: null,
	});

	return (
		<form action={formAction} className='flex flex-col gap-3'>
			<input type='hidden' name='userId' value={userId} />
			<label className='flex flex-col gap-1'>
				<span className='text-typo-secondary text-sm'>{t('Site role')}</span>
				<select
					name='role'
					defaultValue={currentRole}
					disabled={pending}
					className='p-2 rounded bg-neutral-800 border border-neutral-700 w-48'>
					<option value='user'>{t('User')}</option>
					<option value='admin'>{t('Admin')}</option>
				</select>
			</label>
			{state.error && (
				<p className='text-red-400 text-sm'>{state.error}</p>
			)}
			{state.success && (
				<p className='text-green-400 text-sm'>{t('Role updated successfully')}</p>
			)}
			<div>
				<button
					type='submit'
					disabled={pending}
					className='bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-full cursor-pointer text-sm'>
					{pending ? t('Saving...') : t('Save role')}
				</button>
			</div>
		</form>
	);
}

export function UserBanForm({ userId, isBanned, banReason }: Omit<Props, 'currentRole'>) {
	const t = useExtracted();
	const [state, formAction, pending] = useActionState(updateUserBanAction, {
		error: null,
	});

	return (
		<form action={formAction} className='flex flex-col gap-3'>
			<input type='hidden' name='userId' value={userId} />
			<input type='hidden' name='action' value={isBanned ? 'unban' : 'ban'} />
			{!isBanned && (
				<>
					<label className='flex flex-col gap-1'>
						<span className='text-typo-secondary text-sm'>{t('Ban reason')}</span>
						<input
							type='text'
							name='banReason'
							defaultValue={banReason ?? ''}
							disabled={pending}
							placeholder={t('Optional reason...')}
							className='p-2 rounded bg-neutral-800 border border-neutral-700'
						/>
					</label>
					<label className='flex flex-col gap-1'>
						<span className='text-typo-secondary text-sm'>{t('Ban expires (optional)')}</span>
						<input
							type='datetime-local'
							name='banExpires'
							disabled={pending}
							className='p-2 rounded bg-neutral-800 border border-neutral-700'
						/>
					</label>
				</>
			)}
			{state.error && (
				<p className='text-red-400 text-sm'>{state.error}</p>
			)}
			{state.success && (
				<p className='text-green-400 text-sm'>
					{isBanned ? t('User unbanned successfully') : t('User banned successfully')}
				</p>
			)}
			<div>
				<button
					type='submit'
					disabled={pending}
					className={`${isBanned ? 'bg-green-800 hover:bg-green-700' : 'bg-red-900 hover:bg-red-800'} disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-full cursor-pointer text-sm`}>
					{pending
						? t('Saving...')
						: isBanned
							? t('Unban user')
							: t('Ban user')}
				</button>
			</div>
		</form>
	);
}
