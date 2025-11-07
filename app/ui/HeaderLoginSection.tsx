'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HeaderLoginSection() {
	const path = usePathname();

	return (
		<>
			<Link
				href={`/auth/login?back=${encodeURIComponent(path)}`}
				className='text-typo-secondary py-2 px-4 rounded-lg font-bold hover:bg-white/15 hover:text-white cursor-pointer'>
				Log in
			</Link>
			<Link
				href={`/auth/signup?back=${encodeURIComponent(path)}`}
				className='bg-highlight text-white py-2 px-4 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer'>
				Sign up
			</Link>
		</>
	);
}
