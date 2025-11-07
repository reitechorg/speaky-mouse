'use server';

// import { getSession } from '@/lib/auth-client';
import { getUser } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export async function Header() {
	const session = await getUser();

	return (
		<header className='flex justify-between items-center  p-4'>
			<div className='flex gap-4 items-center'>
				<Image
					src='/icon.webp'
					alt='Speaky Mouse Logo'
					width={64}
					height={64}
					className='w-15 h-15 object-scale-down'
				/>
				<div>
					<div className='text-[#c8e6f1] font-semibold text-xl'>
						Speaky Mouse
					</div>
					<div className='text-accent text-sm'>
						Let every language squeak!
					</div>
				</div>
			</div>

			<div className='flex gap-2 items-center'>
				{!session?.user && (
					<>
						<Link
							href='/auth/login'
							className='text-typo-secondary py-2 px-4 rounded-lg font-bold hover:bg-white/15 hover:text-white cursor-pointer'>
							Log in
						</Link>
						<Link
							href='/auth/login'
							className='bg-highlight text-white py-2 px-4 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer'>
							Sign up
						</Link>
					</>
				)}
				{session?.user && (
					<div className='flex gap-4 items-center'>
						<span className='text-typo-secondary'>
							Hello, {session.user.name || 'User'} (
							{session.user.role})!
						</span>
						<LogoutButton />
					</div>
				)}
			</div>
		</header>
	);
}
