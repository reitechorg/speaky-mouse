'use server';

// import { getSession } from '@/lib/auth-client';
import { getUser } from '@/lib/auth';
import Image from 'next/image';
import { LogoutButton } from './LogoutButton';
import { HeaderLoginSection } from './HeaderLoginSection';
import { getTranslations } from '@/lib/lang';

export async function Header() {
	const session = await getUser();
	const t = await getTranslations();

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
						{t['app.title']}
					</div>
					<div className='text-accent text-sm'>
						{t['app.description']}
					</div>
				</div>
			</div>

			<div className='flex gap-2 items-center'>
				{!session?.user && <HeaderLoginSection />}
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
