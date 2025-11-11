import { Metadata } from 'next';
import { getExtracted } from 'next-intl/server';

export const metadata: Metadata = {
	title: 'Admin Dashboard - Speaky mouse',
	description: 'Manage instance settings and projects',
};

export default async function AdminPage() {
	const t = await getExtracted();

	return (
		<div>
			<h1 className='text-typo-primary font-semibold text-2xl'>
				{t('Overview')}
			</h1>
			<p className='text-typo-secondary'>
				{t(
					'Welcome to the admin dashboard. We are planning to add stats here',
				)}
			</p>
		</div>
	);
}
