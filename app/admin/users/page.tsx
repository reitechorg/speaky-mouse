import { getExtracted } from 'next-intl/server';
import { UsersTable } from './UserTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'User Management - Speaky mouse',
};

export default async function ManageUsersPage() {
	const t = await getExtracted();
	return (
		<div className='flex flex-col gap-4'>
			<div>
				<h1 className='text-typo-primary font-semibold text-2xl'>
					{t('User management')}
				</h1>
				<p className='text-typo-secondary'>
					¨{t('Here you can manage users (not implemented yet)')}
				</p>
			</div>
			<div>
				<UsersTable />
			</div>
		</div>
	);
}
