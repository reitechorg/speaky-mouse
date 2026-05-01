'use client';

import { Modal } from '@/app/ui/Modal';
import { langCodes } from '@/lib/lang-codes';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { useExtracted, useLocale } from 'next-intl';
import { useActionState, useState } from 'react';
import { createSourceFileAction } from './createSourceFileAction';

export function CreateSourceFileModal({
	projectSlug,
	defaultSourceLanguage,
	defaultTargetLanguages,
}: {
	projectSlug: string;
	defaultSourceLanguage: string;
	defaultTargetLanguages: string[];
}) {
	const [isOpen, setIsOpen] = useState(false);
	const t = useExtracted();
	const locale = useLocale();

	const [state, formAction, pending] = useActionState(
		createSourceFileAction,
		{ error: null },
	);

	if (state.success && isOpen) {
		setIsOpen(false);
	}

	return (
		<>
			<button
				className='text-primary hover:underline cursor-pointer'
				onClick={() => setIsOpen(true)}>
				+ {t('Add new source file')}
			</button>

			{isOpen && (
				<Modal>
					<div className='flex justify-between items-center'>
						<h2 className='text-xl font-semibold'>
							{t('Add new source file')}
						</h2>
						<button
							disabled={pending}
							onClick={() => setIsOpen(false)}
							className='text-white/50 hover:text-white disabled:cursor-not-allowed disabled:text-white/25 cursor-pointer'>
							✕
						</button>
					</div>

					<form
						action={formAction}
						className='flex flex-col gap-4'>
						<input
							type='hidden'
							name='projectSlug'
							value={projectSlug}
						/>

						<label className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>
								{t('Title')}
							</span>
							<input
								type='text'
								name='title'
								disabled={pending}
								placeholder='strings.json'
								className='p-2 rounded bg-neutral-800 border border-neutral-700'
							/>
						</label>

						<label className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>
								{t('File format')}
							</span>
							<select
								name='parser'
								defaultValue={FileParser.Json}
								disabled={pending}
								className='p-2 rounded bg-neutral-800 border border-neutral-700'>
								{Object.values(FileParser).map((p) => (
									<option key={p} value={p}>
										{p}
									</option>
								))}
							</select>
						</label>

						<label className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>
								{t('Source language')}
							</span>
							<select
								name='sourceLanguage'
								defaultValue={defaultSourceLanguage || locale}
								disabled={pending}
								className='p-2 rounded bg-neutral-800 border border-neutral-700'>
								{Object.entries(langCodes).map(
									([code, name]) => (
										<option key={code} value={code}>
											{code} - {name}
										</option>
									),
								)}
							</select>
						</label>

						<div className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>
								{t('Target languages')}
							</span>
							<div className='grid grid-cols-2 gap-1 max-h-36 overflow-y-auto border border-neutral-700 rounded p-2'>
								{Object.entries(langCodes).map(
									([code, name]) => (
										<label
											key={code}
											className='flex items-center gap-1.5 text-sm cursor-pointer'>
											<input
												type='checkbox'
												name='targetLanguages'
												value={code}
												defaultChecked={defaultTargetLanguages.includes(
													code,
												)}
												disabled={pending}
											/>
											<span>
												{code} – {name}
											</span>
										</label>
									),
								)}
							</div>
						</div>

						<label className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>
								{t('Initial file (optional)')}
							</span>
							<input
								type='file'
								name='file'
								disabled={pending}
								className='text-sm'
							/>
						</label>

						{state.error && (
							<p className='text-red-400 text-sm'>{state.error}</p>
						)}

						<div className='flex justify-end'>
							<button
								type='submit'
								disabled={pending}
								className='bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-full cursor-pointer'>
								{pending
									? t('Creating...')
									: t('Create source file')}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
