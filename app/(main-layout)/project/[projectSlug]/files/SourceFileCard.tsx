'use client';

import { Modal } from '@/app/ui/Modal';
import { langCodes } from '@/lib/lang-codes';
import { useExtracted } from 'next-intl';
import { useActionState, useState } from 'react';
import { downloadSourceFileAction } from './download-source-file-action';
import { importTranslationsAction } from './import-translations-action';
import { renameSourceFileAction } from './rename-source-file-action';
import { uploadFileAction } from './upload-file-action';

type SourceFile = {
	id: string;
	title: string;
	parser: string | null;
	sourceLanguage: string;
};

export function SourceFileCard({
	file,
	targetLanguages,
	projectSlug,
}: {
	file: SourceFile;
	targetLanguages: string[];
	projectSlug: string;
}) {
	const t = useExtracted();

	const [renameOpen, setRenameOpen] = useState(false);
	const [importTransOpen, setImportTransOpen] = useState(false);
	const [downloading, setDownloading] = useState<string | null>(null);

	const [renameState, renameAction, renamePending] = useActionState(
		renameSourceFileAction,
		{ error: null },
	);
	const [importState, importAction, importPending] = useActionState(
		importTranslationsAction,
		{ error: null },
	);

	if (renameState.success && renameOpen) setRenameOpen(false);

	const handleDownload = async (lang: string) => {
		setDownloading(lang);
		try {
			const result = await downloadSourceFileAction(file.id, lang);
			if ('error' in result) {
				alert(result.error);
				return;
			}
			for (const f of result.files) {
				const blob = new Blob([f.content], { type: 'text/plain;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = f.path.split('/').pop() || `${lang}.${file.parser === 'UnityCsv' ? 'csv' : 'json'}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} finally {
			setDownloading(null);
		}
	};

	const fileAccept = file.parser === 'UnityCsv' ? '.csv,text/csv' : '.json,application/json';

	return (
		<div className='p-4 border border-primary/10 rounded-md flex flex-col gap-3'>
			<div className='flex items-center justify-between gap-2'>
				<h3 className='text-typo-primary font-medium text-lg'>
					{file.title}{' '}
					<span className='text-typo-secondary text-sm font-normal'>
						({file.parser})
					</span>
				</h3>
				<button
					onClick={() => setRenameOpen(true)}
					className='text-primary hover:underline cursor-pointer text-sm shrink-0'>
					{t('Rename')}
				</button>
			</div>

			{/* Upload new source version */}
			<div className='flex flex-col gap-1'>
				<span className='text-typo-secondary text-xs uppercase tracking-wide'>
					{t('Source strings')}
				</span>
				<form action={uploadFileAction} className='flex items-center gap-2 flex-wrap'>
					<input type='hidden' name='fileId' value={file.id} />
					<input type='file' name='file' accept={fileAccept} className='text-sm' />
					<button
						className='text-primary hover:underline cursor-pointer text-sm'
						type='submit'>
						{t('Upload new version')}
					</button>
				</form>
			</div>

			{/* Translations */}
			<div className='flex flex-col gap-1'>
				<span className='text-typo-secondary text-xs uppercase tracking-wide'>
					{t('Translations')}
				</span>
				<div className='flex items-center gap-3 flex-wrap'>
					<button
						onClick={() => {
							setImportTransOpen(true);
						}}
						className='text-primary hover:underline cursor-pointer text-sm'>
						{t('Import translations')}
					</button>
					<span className='text-typo-secondary text-sm'>|</span>
					<span className='text-typo-secondary text-sm'>{t('Download:')}</span>
					{targetLanguages.length === 0 && (
						<span className='text-typo-secondary text-sm italic'>
							{t('No target languages configured')}
						</span>
					)}
					{targetLanguages.map((lang) => (
						<button
							key={lang}
							onClick={() => handleDownload(lang)}
							disabled={downloading !== null}
							className='text-primary hover:underline cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed'>
							{downloading === lang
								? `${langCodes[lang as keyof typeof langCodes] ?? lang}…`
								: `${langCodes[lang as keyof typeof langCodes] ?? lang} (${lang})`}
						</button>
					))}
				</div>
			</div>

			{/* Rename modal */}
			{renameOpen && (
				<Modal>
					<div className='flex justify-between items-center'>
						<h2 className='text-xl font-semibold'>{t('Rename source file')}</h2>
						<button
							onClick={() => setRenameOpen(false)}
							disabled={renamePending}
							className='text-white/50 hover:text-white disabled:text-white/25 disabled:cursor-not-allowed cursor-pointer'>
							✕
						</button>
					</div>
					<form action={renameAction} className='flex flex-col gap-4'>
						<input type='hidden' name='fileId' value={file.id} />
						<input type='hidden' name='projectSlug' value={projectSlug} />
						<label className='flex flex-col gap-1'>
							<span className='text-typo-secondary'>{t('New title')}</span>
							<input
								type='text'
								name='title'
								defaultValue={file.title}
								disabled={renamePending}
								className='p-2 rounded bg-neutral-800 border border-neutral-700'
							/>
						</label>
						{renameState.error && (
							<p className='text-red-400 text-sm'>{renameState.error}</p>
						)}
						<div className='flex justify-end gap-2'>
							<button
								type='button'
								onClick={() => setRenameOpen(false)}
								disabled={renamePending}
								className='py-2 px-4 rounded-full cursor-pointer text-typo-secondary hover:text-typo-primary disabled:opacity-50'>
								{t('Cancel')}
							</button>
							<button
								type='submit'
								disabled={renamePending}
								className='bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-full cursor-pointer'>
								{renamePending ? t('Renaming...') : t('Rename')}
							</button>
						</div>
					</form>
				</Modal>
			)}

			{/* Import translations modal */}
			{importTransOpen && (
				<Modal>
					<div className='flex justify-between items-center'>
						<h2 className='text-xl font-semibold'>{t('Import translations')}</h2>
						<button
							onClick={() => {
								setImportTransOpen(false);
							}}
							disabled={importPending}
							className='text-white/50 hover:text-white disabled:text-white/25 disabled:cursor-not-allowed cursor-pointer'>
							✕
						</button>
					</div>

					{importState.success ? (
						<div className='flex flex-col gap-4'>
							<p className='text-green-400'>
								{t('Import complete')}:{' '}
								{importState.result?.imported ?? 0} {t('imported')},{' '}
								{importState.result?.skipped ?? 0} {t('skipped')},{' '}
								{importState.result?.notFound ?? 0} {t('keys not found')}
							</p>
							<div className='flex justify-end'>
								<button
									onClick={() => setImportTransOpen(false)}
									className='bg-white/10 hover:bg-white/15 py-2 px-6 rounded-full cursor-pointer'>
									{t('Close')}
								</button>
							</div>
						</div>
					) : (
						<form action={importAction} className='flex flex-col gap-4'>
							<input type='hidden' name='fileId' value={file.id} />

							<label className='flex flex-col gap-1'>
								<span className='text-typo-secondary'>{t('Language')}</span>
								<select
									name='language'
									disabled={importPending}
									className='p-2 rounded bg-neutral-800 border border-neutral-700'>
									{targetLanguages.map((lang) => (
										<option key={lang} value={lang}>
											{langCodes[lang as keyof typeof langCodes] ?? lang} ({lang})
										</option>
									))}
								</select>
							</label>

							<label className='flex flex-col gap-1'>
								<span className='text-typo-secondary'>{t('Translation file')}</span>
								<input
									type='file'
									name='file'
									accept={fileAccept}
									disabled={importPending}
									className='text-sm'
								/>
							</label>

							<label className='flex flex-col gap-1'>
								<span className='text-typo-secondary'>{t('Conflict mode')}</span>
								<select
									name='conflictMode'
									disabled={importPending}
									className='p-2 rounded bg-neutral-800 border border-neutral-700'>
									<option value='OVERWRITE'>
										{t('Overwrite all existing translations')}
									</option>
									<option value='SKIP_EXISTING'>
										{t('Skip already translated strings')}
									</option>
									<option value='SKIP_APPROVED'>
										{t('Skip approved, overwrite unapproved')}
									</option>
								</select>
							</label>

							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									name='autoApprove'
									disabled={importPending}
								/>
								<span className='text-typo-secondary text-sm'>
									{t('Auto-approve imported translations')}
								</span>
							</label>

							{importState.error && (
								<p className='text-red-400 text-sm'>{importState.error}</p>
							)}

							<div className='flex justify-end gap-2'>
								<button
									type='button'
									onClick={() => setImportTransOpen(false)}
									disabled={importPending}
									className='py-2 px-4 rounded-full cursor-pointer text-typo-secondary hover:text-typo-primary disabled:opacity-50'>
									{t('Cancel')}
								</button>
								<button
									type='submit'
									disabled={importPending || targetLanguages.length === 0}
									className='bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-6 rounded-full cursor-pointer'>
									{importPending ? t('Importing...') : t('Import')}
								</button>
							</div>
						</form>
					)}
				</Modal>
			)}
		</div>
	);
}
