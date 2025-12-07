'use client';

import { Modal } from '@/app/ui/Modal';
import { langCodes } from '@/lib/lang-codes';
import { useActionState, useState } from 'react';
import { createProject } from './create-project-action';
import { useExtracted, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function CreateNewProjectModal() {
	const [isOpen, setIsOpen] = useState(false);
	const t = useExtracted();
	const locale = useLocale();
	const router = useRouter();

	const [state, formAction, formPending] = useActionState(createProject, {
		error: null,
	});

	const pending = formPending || !!state.project;
	if (state.project) {
		router.push(`/project/${state.project.slug}/settings`);
	}

	return (
		<>
			<button
				className='bg-white/10 hover:bg-white/15 text-center py-2 px-6 rounded-full cursor-pointer'
				onClick={() => setIsOpen(true)}>
				New project
			</button>
			{isOpen && (
				<Modal>
					<div className='flex justify-between items-center'>
						<h2 className='text-xl font-semibold'>
							{t('Create New Project')}
						</h2>
						{pending && (
							<button
								className='text-white/25 cursor-not-allowed'
								disabled={pending}>
								✕
							</button>
						)}
						{!pending && (
							<button
								disabled={pending}
								className='text-white/50 hover:text-white cursor-pointer'
								onClick={() => setIsOpen(false)}>
								✕
							</button>
						)}
					</div>
					<form className='flex flex-col gap-4' action={formAction}>
						<label>
							<div className='text-typo-secondary'>
								{t('Project title')}:
							</div>
							<input
								placeholder='My awesome project'
								type='text'
								name='name'
								disabled={pending}
								className='w-full mt-1 p-2 rounded bg-neutral-800 border border-neutral-700'
							/>
						</label>
						<label>
							<div className='text-typo-secondary'>
								{t('Description')}:
							</div>
							<textarea
								placeholder='Lets build something great...'
								name='description'
								disabled={pending}
								className='w-full mt-1 p-2 rounded bg-neutral-800 border border-neutral-700 resize-none field-sizing-content min-h-16'
							/>
						</label>
						<label>
							<div className='text-typo-secondary'>
								{t('Language to translate from')}:
							</div>
							<select
								name='sourceLanguage'
								defaultValue={locale}
								disabled={pending}
								className='mt-1 p-2 rounded bg-neutral-800 border border-neutral-700'>
								{Object.entries(langCodes).map(
									([code, name]) => (
										<option key={code} value={code}>
											{code} - {name}
										</option>
									),
								)}
							</select>
						</label>
						<div className='flex justify-end'>
							{pending && (
								<button
									disabled={pending}
									className={`cursor-not-allowed bg-white/10 opacity-50 text-center py-2 px-6 rounded-full`}>
									{t('Create project')}
								</button>
							)}
							{!pending && (
								<button
									disabled={pending}
									className={`cursor-pointer bg-white/10 hover:bg-white/15 text-center py-2 px-6 rounded-full`}>
									{t('Create project')}
								</button>
							)}
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
