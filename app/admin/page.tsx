import { getExtracted } from 'next-intl/server';

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
