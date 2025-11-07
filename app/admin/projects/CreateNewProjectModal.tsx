'use client';

import { Modal } from '@/app/ui/Modal';
import { langCodes } from '@/lib/lang-codes';
import { useActionState, useState } from 'react';
import { createProject } from './create-project-action';
import { useFormStatus } from 'react-dom';

export function CreateNewProjectModal() {
	const [isOpen, setIsOpen] = useState(false);

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
							Create New Project
						</h2>
						<button
							className='text-white/50 hover:text-white cursor-pointer'
							onClick={() => setIsOpen(false)}>
							✕
						</button>
					</div>
					<form
						className='flex flex-col gap-4'
						action={createProject}>
						<label>
							<div className='text-typo-secondary'>
								Project title:
							</div>
							<input
								placeholder='My awesome project'
								type='text'
								name='name'
								className='w-full mt-1 p-2 rounded bg-neutral-800 border border-neutral-700'
							/>
						</label>
						<label>
							<div className='text-typo-secondary'>
								Description:
							</div>
							<textarea
								placeholder='Lets build something great...'
								name='description'
								className='w-full mt-1 p-2 rounded bg-neutral-800 border border-neutral-700 resize-none field-sizing-content min-h-16'
							/>
						</label>
						<label>
							<div className='text-typo-secondary'>
								Language to translate from:
							</div>
							<select
								name='sourceLanguage'
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
							<button
								className={`cursor-pointer bg-white/10 hover:bg-white/15 text-center py-2 px-6 rounded-full`}>
								Create project
							</button>
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
