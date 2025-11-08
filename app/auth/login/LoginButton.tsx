'use client';

import { signIn } from '@/lib/auth-client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export function LoginButton(prosps: {
	provider: string;
	title: string;
	iconUrl?: string;
}) {
	const params = useSearchParams();
	const callbackUrl = params.get('back');

	return (
		<button
			onClick={() => {
				signIn.social({
					provider: prosps.provider,
					callbackURL: callbackUrl || window.location.href,
				});
			}}
			className='border-b border-neutral-400 last-of-type:border-b-0 px-4 py-2 w-full flex items-center justify-start gap-2 hover:bg-neutral-200 cursor-pointer'>
			<Image
				src={prosps.iconUrl || '/login-providers/generic-link.png'}
				alt={`${prosps.title} icon`}
				width={20}
				height={20}
				className='w-4 h-4 object-contain'
			/>
			{prosps.title}
		</button>
	);
}
