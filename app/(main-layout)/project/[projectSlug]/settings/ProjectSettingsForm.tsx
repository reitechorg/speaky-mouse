'use client';

import { useActionState } from 'react';
import { updateProjectAction } from './settings-actions';
import { useExtracted } from 'next-intl';
import { langCodes } from '@/lib/lang-codes';

type Props = {
	slug: string;
	title: string;
	description: string | null;
	imageUrl: string | null;
	publicVisible: boolean;
	publicJoin: boolean;
	publicDownload: boolean;
	defaultSourceLanguage: string;
	defaultTargetLanguages: string[];
};

export function ProjectSettingsForm({
	slug,
	title,
	description,
	imageUrl,
	publicVisible,
	publicJoin,
	publicDownload,
	defaultSourceLanguage,
	defaultTargetLanguages,
}: Props) {
	const t = useExtracted();
	const [state, formAction, pending] = useActionState(updateProjectAction, {
		error: null,
	});

	return (
		<form action={formAction} className='flex flex-col gap-4'>
			<input type='hidden' name='slug' value={slug} />

			<div className='flex flex-col gap-4 border border-primary/10 rounded-md p-4'>
				<h2 className='font-semibold text-typo-primary'>
					{t('General')}
				</h2>
				<label className='flex flex-col gap-1'>
					<span className='text-typo-secondary text-sm'>
						{t('Project title')}
					</span>
					<input
						type='text'
						name='title'
						defaultValue={title}
						disabled={pending}
						className='p-2 rounded bg-neutral-800 border border-neutral-700'
					/>
				</label>
				<label className='flex flex-col gap-1'>
					<span className='text-typo-secondary text-sm'>
						{t('Description')}
					</span>
					<textarea
						name='description'
						defaultValue={description ?? ''}
						disabled={pending}
						rows={3}
						className='p-2 rounded bg-neutral-800 border border-neutral-700 resize-none'
					/>
				</label>
				<label className='flex flex-col gap-1'>
					<span className='text-typo-secondary text-sm'>
						{t('Image URL')}
					</span>
					<input
						type='text'
						name='imageUrl'
						defaultValue={imageUrl ?? ''}
						disabled={pending}
						placeholder='https://...'
						className='p-2 rounded bg-neutral-800 border border-neutral-700'
					/>
				</label>
			</div>

			<div className='flex flex-col gap-4 border border-primary/10 rounded-md p-4'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Visibility')}
				</h2>
				<label className='flex items-center gap-3 cursor-pointer'>
					<input
						type='checkbox'
						name='publicVisible'
						defaultChecked={publicVisible}
						disabled={pending}
						className='w-4 h-4'
					/>
					<div>
						<div className='text-typo-primary text-sm'>
							{t('Public visibility')}
						</div>
						<div className='text-typo-secondary text-xs'>
							{t('Allow anyone to see this project')}
						</div>
					</div>
				</label>
				<label className='flex items-center gap-3 cursor-pointer'>
					<input
						type='checkbox'
						name='publicJoin'
						defaultChecked={publicJoin}
						disabled={pending}
						className='w-4 h-4'
					/>
					<div>
						<div className='text-typo-primary text-sm'>
							{t('Public join')}
						</div>
						<div className='text-typo-secondary text-xs'>
							{t('Allow anyone to join as a translator')}
						</div>
					</div>
				</label>
				<label className='flex items-center gap-3 cursor-pointer'>
					<input
						type='checkbox'
						name='publicDownload'
						defaultChecked={publicDownload}
						disabled={pending}
						className='w-4 h-4'
					/>
					<div>
						<div className='text-typo-primary text-sm'>
							{t('Public download')}
						</div>
						<div className='text-typo-secondary text-xs'>
							{t('Allow anyone to download translations without authentication')}
						</div>
					</div>
				</label>
			</div>

			<div className='flex flex-col gap-4 border border-primary/10 rounded-md p-4'>
				<h2 className='font-semibold text-typo-primary'>
					{t('Languages')}
				</h2>
				<label className='flex flex-col gap-1'>
					<span className='text-typo-secondary text-sm'>
						{t('Source language')}
					</span>
					<select
						name='defaultSourceLanguage'
						defaultValue={defaultSourceLanguage}
						disabled={pending}
						className='p-2 rounded bg-neutral-800 border border-neutral-700'>
						{Object.entries(langCodes).map(([code, name]) => (
							<option key={code} value={code}>
								{code} - {name}
							</option>
						))}
					</select>
				</label>
				<div className='flex flex-col gap-1'>
					<span className='text-typo-secondary text-sm'>
						{t('Default target languages')}
					</span>
					<div className='grid grid-cols-3 gap-1 max-h-48 overflow-y-auto border border-primary/10 rounded p-2'>
						{Object.entries(langCodes).map(([code, name]) => (
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
						))}
					</div>
				</div>
			</div>

			{state.error && (
				<p className='text-red-400 text-sm'>{state.error}</p>
			)}
			{state.success && (
				<p className='text-green-400 text-sm'>
					{t('Settings saved successfully')}
				</p>
			)}

			<div>
				<button
					type='submit'
					disabled={pending}
					className='bg-highlight text-background px-6 py-2 rounded-lg font-bold hover:bg-[#4e9192] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
					{pending ? t('Saving...') : t('Save settings')}
				</button>
			</div>
		</form>
	);
}
