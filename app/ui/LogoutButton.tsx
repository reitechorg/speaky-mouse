'use client';

import { signOut } from '@/lib/auth-client';
import { useExtracted } from 'next-intl';

export function LogoutButton() {
	const t = useExtracted();
	return (
		<button
			onClick={async () => {
				await signOut();
				window.location.reload();
			}}
			className='bg-highlight text-white py-2 px-4 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer'>
			{t('Log out')}
		</button>
	);
}
