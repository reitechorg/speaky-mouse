'use client';

import { signOut } from '@/lib/auth-client';

export function LogoutButton() {
	return (
		<button
			onClick={async () => {
				await signOut();
				window.location.reload();
			}}
			className='bg-highlight text-white py-2 px-4 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer'>
			Log out
		</button>
	);
}
