'use client';

import { useActionState } from 'react';
import {
	updateMemberRoleAction,
	removeMemberAction,
	addMemberAction,
} from './settings-actions';
import { useExtracted } from 'next-intl';
import Image from 'next/image';

type Member = {
	userId: string;
	role: string;
	user: {
		name: string;
		email: string;
		image: string | null;
	};
};

const PROJECT_ROLES = ['TRANSLATOR', 'REVIEWER', 'MODERATOR', 'ADMIN'];

function MemberRow({ member, slug }: { member: Member; slug: string }) {
	const t = useExtracted();
	const [roleState, roleAction, rolePending] = useActionState(
		updateMemberRoleAction,
		{ error: null },
	);
	const [removeState, removeAction, removePending] = useActionState(
		removeMemberAction,
		{ error: null },
	);

	const isOwner = member.role === 'OWNER';

	return (
		<tr className='border-b border-primary/10'>
			<td className='py-2 pr-4'>
				<div className='flex items-center gap-2'>
					<Image
						src={member.user.image || '/icon-square.png'}
						alt={member.user.name}
						width={32}
						height={32}
						unoptimized
						className='w-8 h-8 rounded-lg object-cover bg-white/10'
					/>
					<div>
						<div className='text-sm text-typo-primary'>
							{member.user.name}
						</div>
						<div className='text-xs text-typo-secondary'>
							{member.user.email}
						</div>
					</div>
				</div>
			</td>
			<td className='py-2 pr-4'>
				{isOwner ? (
					<span className='text-sm text-typo-secondary'>OWNER</span>
				) : (
					<form action={roleAction} className='flex items-center gap-2'>
						<input type='hidden' name='slug' value={slug} />
						<input
							type='hidden'
							name='userId'
							value={member.userId}
						/>
						<select
							name='role'
							defaultValue={member.role}
							disabled={rolePending}
							className='text-sm p-1 rounded bg-neutral-800 border border-neutral-700'>
							{PROJECT_ROLES.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
						<button
							type='submit'
							disabled={rolePending}
							className='text-xs text-primary hover:underline disabled:opacity-50 cursor-pointer'>
							{rolePending ? t('Saving...') : t('Save')}
						</button>
						{roleState.error && (
							<span className='text-xs text-red-400'>
								{roleState.error}
							</span>
						)}
					</form>
				)}
			</td>
			<td className='py-2 text-right'>
				{!isOwner && (
					<form action={removeAction}>
						<input type='hidden' name='slug' value={slug} />
						<input
							type='hidden'
							name='userId'
							value={member.userId}
						/>
						<button
							type='submit'
							disabled={removePending}
							className='text-xs text-red-400 hover:text-red-300 disabled:opacity-50 cursor-pointer'>
							{removePending ? t('Removing...') : t('Remove')}
						</button>
						{removeState.error && (
							<span className='text-xs text-red-400 ml-2'>
								{removeState.error}
							</span>
						)}
					</form>
				)}
			</td>
		</tr>
	);
}

export function MembersSection({
	members,
	slug,
}: {
	members: Member[];
	slug: string;
}) {
	const t = useExtracted();
	const [addState, addAction, addPending] = useActionState(addMemberAction, {
		error: null,
	});

	return (
		<div className='flex flex-col gap-4 border border-primary/10 rounded-md p-4'>
			<h2 className='font-semibold text-typo-primary'>
				{t('Members')}
			</h2>

			<table className='w-full text-sm'>
				<thead>
					<tr className='text-typo-secondary text-left'>
						<th className='pb-2'>{t('User')}</th>
						<th className='pb-2'>{t('Role')}</th>
						<th className='pb-2'></th>
					</tr>
				</thead>
				<tbody>
					{members.map((member) => (
						<MemberRow
							key={member.userId}
							member={member}
							slug={slug}
						/>
					))}
				</tbody>
			</table>

			<div className='border-t border-primary/10 pt-4'>
				<h3 className='text-sm font-medium text-typo-primary mb-3'>
					{t('Invite member by email')}
				</h3>
				<form action={addAction} className='flex flex-col gap-2'>
					<input type='hidden' name='slug' value={slug} />
					<div className='flex gap-2'>
						<input
							type='email'
							name='email'
							placeholder={t('user@example.com')}
							disabled={addPending}
							className='flex-1 p-2 rounded bg-neutral-800 border border-neutral-700 text-sm'
						/>
						<select
							name='role'
							defaultValue='TRANSLATOR'
							disabled={addPending}
							className='p-2 rounded bg-neutral-800 border border-neutral-700 text-sm'>
							{PROJECT_ROLES.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
						<button
							type='submit'
							disabled={addPending}
							className='bg-highlight text-background px-4 py-2 rounded-lg font-bold hover:bg-[#4e9192] disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer'>
							{addPending ? t('Adding...') : t('Add')}
						</button>
					</div>
					{addState.error && (
						<p className='text-red-400 text-sm'>{addState.error}</p>
					)}
					{addState.success && (
						<p className='text-green-400 text-sm'>
							{t('Member added successfully')}
						</p>
					)}
				</form>
			</div>
		</div>
	);
}
