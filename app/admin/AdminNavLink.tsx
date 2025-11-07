'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNavLink(props: {
	children?: React.ReactNode;
	href: string;
	exact?: boolean;
}) {
	const pathName = usePathname();
	const activeExact = pathName === props.href;
	const activePartial = activeExact || pathName.startsWith(props.href);
	const active = props.exact ? activeExact : activePartial;

	return (
		<Link
			href={props.href}
			className={`px-4 py-2 hover:bg-white/10 rounded-2xl ${
				active ? 'bg-white/15 font-semibold' : ''
			}`}>
			{props.children}
		</Link>
	);
}
