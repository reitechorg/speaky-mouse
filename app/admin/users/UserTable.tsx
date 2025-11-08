'use client';

import { authClient } from '@/lib/auth-client';
import { UserWithRole } from 'better-auth/plugins';
import { useExtracted } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function UsersTable() {
	const [users, setUsers] = useState<UserWithRole[]>([]);
	const t = useExtracted();

	useEffect(() => {
		// Fetch users when component mounts
		authClient.admin
			.listUsers({
				query: {},
			})
			.then(({ data, error }) => {
				if (!error) {
					setUsers(data.users);
				}
			});
	}, []);

	return (
		<table className='w-full border border-zinc-800 bg-black/10'>
			<thead>
				<tr>
					<th className='border-b border-zinc-800 p-2 text-left'>
						{t('Name')}
					</th>
					<th className='border-b border-zinc-800 p-2 text-left'>
						{t('Email')}
					</th>
					<th className='border-b border-zinc-800 p-2 text-left'>
						{t('Role')}
					</th>
					<th className='border-b border-zinc-800 p-2 text-right pr-4'>
						{t('Actions')}
					</th>
				</tr>
			</thead>
			<tbody>
				{users.map((user) => (
					<tr key={user.id}>
						<td className='border-b border-zinc-800 p-2'>
							{user.name}
						</td>
						<td className='border-b border-zinc-800 p-2'>
							{user.email}
						</td>
						<td className='border-b border-zinc-800 p-2'>
							{user.role}
						</td>
						<td className='border-b border-zinc-800 p-2 text-right pr-4'>
							<Link
								href={`/admin/users/${user.id}`}
								className='text-blue-500 hover:underline'>
								{t('Edit')}
							</Link>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
