import Image from 'next/image';
import { AdminNavLink } from './AdminNavLink';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canRunSetup } from '../setup/page';

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
					<div className='font-semibold'>Speaky Mouse Admin</div>
				</div>
				<div className='p-2 flex flex-col gap-1'>
					<AdminNavLink href='/admin' exact>
						Overview
					</AdminNavLink>
					<AdminNavLink href='/admin/projects'>Projects</AdminNavLink>
					<AdminNavLink href='/admin/users'>Users</AdminNavLink>
				</div>
			</div>
			<div className='grow p-4'>{children}</div>
		</div>
	);
}
