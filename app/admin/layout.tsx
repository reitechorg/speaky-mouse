import Image from 'next/image';
import { AdminNavLink } from './AdminNavLink';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canRunSetup } from '../setup/page';
import { getExtracted } from 'next-intl/server';
import { AdminLogoutButton } from './AdminLogoutButton';
import Link from 'next/link';

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const t = await getExtracted();
	const user = await getUser();
	if (!user) {
		const needSetup = await canRunSetup();
		if (needSetup) {
			redirect('/setup');
		}

		redirect('/auth/login?back=/admin');
	} else if (user.user.role !== 'admin') {
		redirect('/');
	}

	return (
		<div className='min-h-screen bg-zinc-50 dark:bg-zinc-900 flex'>
			<div className='w-64 border-r border-zinc-200 dark:border-zinc-700 grow-0 flex flex-col gap-6'>
				<div className='flex flex-col items-center'>
					<Image
						src='/icon.webp'
						alt='Speaky Mouse Logo'
						width={64}
						height={64}
						className='m-4'
					/>
					<div className='font-semibold'>
						{t('Speaky Mouse Admin')}
					</div>
				</div>
				<div className='p-2 flex flex-col gap-1'>
					<AdminNavLink href='/admin' exact>
						{t('Overview')}
					</AdminNavLink>
					<AdminNavLink href='/admin/projects'>
						{t('Projects')}
					</AdminNavLink>
					<AdminNavLink href='/admin/users'>
						{t('Users')}
					</AdminNavLink>
				</div>
				<div className='mt-auto p-2'>
					<div className='bg-white/10 rounded-xl flex p-2 gap-2 items-center'>
						<img
							src={user.user.image || '/logo.png'}
							alt={user.user.name || 'User Avatar'}
							className='rounded-md w-12 h-12 object-cover'
							draggable={false}
						/>
						<div className='mr-auto'>
							<Link
								href={`/profile`}
								className='font-semibold text-typo-primary hover:underline'>
								{user.user.name}
							</Link>
							<div className='text-sm text-typo-secondary'>
								{user.user.role}
							</div>
						</div>
						<AdminLogoutButton />
					</div>
				</div>
			</div>
			<div className='grow p-4'>{children}</div>
		</div>
	);
}
