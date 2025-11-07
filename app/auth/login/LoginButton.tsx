'use client';

import { signIn } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';

export function LoginButton() {
	const params = useSearchParams();
	const callbackUrl = params.get('back');

	return (
		<button
			onClick={() => {
				signIn.social({
					provider: 'github',
					callbackURL: callbackUrl || window.location.href,
				});
			}}
			className='border border-neutral-500 rounded px-4 py-2 w-full flex items-center justify-center gap-2 hover:bg-neutral-100'>
			Continue with GitHub
		</button>
	);
}
