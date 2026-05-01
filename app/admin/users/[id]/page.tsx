import { db } from '@/lib/db';
import { getExtracted } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { UserRoleForm, UserBanForm } from './UserEditForms';

export const metadata: Metadata = {
	title: 'Edit User - Speaky mouse',
};

export default async function EditUserPage({
	params,
}: {
	params: { id: string };
}) {
	const { id } = await params;
	const t = await getExtracted();

	const user = await db.user.findUnique({
		where: { id },
		include: {
			accounts: { select: { providerId: true, createdAt: true } },
			memberships: {
				include: {
					project: { select: { title: true, slug: true } },
				},
			},
		},
	});

	if (!user) {
		notFound();
	}

	return (
		<div className='flex flex-col gap-6 max-w-2xl'>
			<div className='flex items-center gap-3'>
				<Link
					href='/admin/users'
					className='text-typo-secondary hover:text-typo-primary text-sm'>
					&larr; {t('Back to users')}
				</Link>
			</div>

			<div className='flex items-center gap-4'>
				<Image
					src={user.image || '/icon-square.png'}
					alt={user.name}
					width={64}
					height={64}
					unoptimized
					className='w-16 h-16 rounded-xl object-cover bg-white/10'
				/>
				<div>
					<h1 className='text-2xl font-semibold text-typo-primary'>
						{user.name}
					</h1>
					<div className='text-typo-secondary'>{user.email}</div>
					<div className='text-xs text-typo-secondary'>
						{t('Joined')}{' '}
						{user.createdAt.toLocaleDateString()}
					</div>
				</div>
				{user.banned && (
					<div className='ml-auto bg-red-900/50 text-red-300 text-sm px-3 py-1 rounded-full'>
						{t('Banned')}
					</div>
				)}
			</div>

			<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-4'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Site role')}
				</h2>
				<UserRoleForm
					userId={user.id}
					currentRole={user.role ?? 'user'}
				/>
			</div>

			<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-4'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Ban management')}
				</h2>
				{user.banned && user.banReason && (
					<div className='text-sm text-typo-secondary'>
						{t('Ban reason')}: {user.banReason}
					</div>
				)}
				{user.banned && user.banExpires && (
					<div className='text-sm text-typo-secondary'>
						{t('Expires')}: {user.banExpires.toLocaleString()}
					</div>
				)}
				<UserBanForm
					userId={user.id}
					isBanned={!!user.banned}
					banReason={user.banReason ?? null}
				/>
			</div>

			<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-3'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Linked accounts')}
				</h2>
				{user.accounts.length === 0 && (
					<p className='text-typo-secondary text-sm'>
						{t('No linked accounts')}
					</p>
				)}
				<div className='flex flex-wrap gap-2'>
					{user.accounts.map((account) => (
						<span
							key={account.providerId}
							className='bg-white/10 text-sm px-3 py-1 rounded-full'>
							{account.providerId}
						</span>
					))}
				</div>
			</div>

			<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-3'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Project memberships')}
				</h2>
				{user.memberships.length === 0 && (
					<p className='text-typo-secondary text-sm'>
						{t('Not a member of any project')}
					</p>
				)}
				<div className='flex flex-col gap-2'>
					{user.memberships.map((membership) => (
						<div
							key={membership.projectId}
							className='flex items-center justify-between text-sm'>
							<Link
								href={`/project/${membership.project.slug}`}
								className='text-primary hover:underline'>
								{membership.project.title}
							</Link>
							<span className='text-typo-secondary'>
								{membership.role}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
