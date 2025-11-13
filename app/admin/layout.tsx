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
				<Link
					href='/'
					className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 hover:underline p-4 cursor-pointer text-sm'>
					<div className='w-4 h-4 flex items-center justify-center'>
						<svg
							width='100%'
							height='100%'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M19 12H5M5 12L12 19M5 12L12 5'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
					<div>{t('Back to the app')}</div>
				</Link>
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
						<Image
							src={user.user.image || '/icon-square.png'}
							alt={user.user.name || 'User Avatar'}
							className='rounded-md w-12 h-12 object-cover'
							draggable={false}
							width={100}
							height={100}
							unoptimized
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
