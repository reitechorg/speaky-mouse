'use client';

import { signIn } from '@/lib/auth-client';

export function LoginButton() {
	return (
		<button
			onClick={() => {
				signIn.social({
					provider: 'github',
					callbackURL: window.location.pathname,
				});
			}}
			className='border border-neutral-500 rounded px-4 py-2 w-full flex items-center justify-center gap-2 hover:bg-neutral-100'>
			Continue with GitHub
		</button>
	);
}
