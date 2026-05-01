'use client';

import { useExtracted } from 'next-intl';
import { deleteProjectAction } from './settings-actions';
import { useState } from 'react';

export function DeleteProjectButton({ slug }: { slug: string }) {
	const t = useExtracted();
	const [confirming, setConfirming] = useState(false);
	const [pending, setPending] = useState(false);

	async function handleDelete() {
		setPending(true);
		await deleteProjectAction(slug);
	}

	if (!confirming) {
		return (
			<button
				onClick={() => setConfirming(true)}
				className='bg-red-900 hover:bg-red-800 text-white py-2 px-4 rounded-lg text-sm cursor-pointer'>
				{t('Delete project')}
			</button>
		);
	}

	return (
		<div className='flex items-center gap-3'>
			<span className='text-sm text-typo-secondary'>
				{t('Are you sure? This cannot be undone.')}
			</span>
			<button
				onClick={handleDelete}
				disabled={pending}
				className='bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm cursor-pointer'>
				{pending ? t('Deleting...') : t('Yes, delete')}
			</button>
			<button
				onClick={() => setConfirming(false)}
				disabled={pending}
				className='text-typo-secondary hover:text-typo-primary text-sm cursor-pointer disabled:opacity-50'>
				{t('Cancel')}
			</button>
		</div>
	);
}
