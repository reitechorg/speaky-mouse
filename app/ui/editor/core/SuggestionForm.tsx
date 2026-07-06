import { useExtracted } from 'next-intl';
import {
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
	useTransition,
} from 'react';
import { SuggestStringAction } from '../actions/suggest';
import { runQaChecks } from '@/lib/qa';
import { authClient } from '@/lib/auth-client';
import { Translation } from '../Editor';
import {
	HighlightedTextarea,
	HighlightedTextareaHandle,
} from './HighlightedTextarea';

export type SuggestionFormHandle = {
	insertVariable: (value: string) => void;
};

function subscribeNoop() {
	return () => {};
}
function getIsMacSnapshot() {
	return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}
function getIsMacServerSnapshot() {
	return false;
}

export const SuggestionForm = forwardRef<
	SuggestionFormHandle,
	{
		maxLength?: number | null;
		originalContent: string;
		id: string;
		language: string;
		nextLocaleString?: () => void;
		addOptimisticTranslation?: (translation: Translation) => void;
	}
>(function SuggestionForm(props, ref) {
	const [content, setContent] = useState<string>('');
	const isMac = useSyncExternalStore(
		subscribeNoop,
		getIsMacSnapshot,
		getIsMacServerSnapshot,
	);
	const t = useExtracted();
	const formRef = useRef<HTMLFormElement>(null);
	const textareaRef = useRef<HighlightedTextareaHandle>(null);
	const [, startTransition] = useTransition();
	const session = authClient.useSession();

	useImperativeHandle(ref, () => ({
		insertVariable: (value: string) => {
			textareaRef.current?.insertAtCursor(value);
		},
	}));

	const submitKey = isMac ? '⌘' : 'Ctrl';
	const nextKey = isMac ? '⌥' : 'Alt';

	async function submitTranslation(formData: FormData) {
		const submittedContent = (formData.get('content') as string) ?? '';
		const user = session.data?.user;
		if (submittedContent.trim() !== '' && user) {
			props.addOptimisticTranslation?.({
				id: `optimistic-${Date.now()}`,
				language: props.language,
				content: submittedContent,
				authorId: user.id,
				createdAt: new Date(),
				updatedAt: new Date(),
				approvedBy: null,
				approvedAt: null,
				author: {
					id: user.id,
					image: user.image ?? null,
					name: user.name,
				},
			});
		}
		await SuggestStringAction(formData);
	}

	const qaIssues = useMemo(
		() =>
			content.trim() === ''
				? []
				: runQaChecks(props.originalContent, content, {
						maxLength: props.maxLength,
					}),
		[props.originalContent, props.maxLength, content],
	);

	return (
		<form
			ref={formRef}
			className='flex flex-col gap-2'
			action={submitTranslation}
			onSubmit={() => {
				setContent('');
			}}>
			<div className='text-typo-secondary text-sm uppercase font-semibold'>
				{t('Editor')}
			</div>
			<input type='hidden' name='locale-string-id' value={props.id} />
			<input type='hidden' name='language' value={props.language} />
			<HighlightedTextarea
				ref={textareaRef}
				autoFocus
				placeholder='Enter your translation here'
				title={`${submitKey}+Enter ${t('to submit')} · ${nextKey}+Enter ${t('to submit & go to next string')}`}
				className='outline-0 field-sizing-content resize-none min-h-20'
				value={content}
				name='content'
				onChange={setContent}
				onKeyDown={(ev) => {
					if (ev.key !== 'Enter' || content.trim() === '') {
						return;
					}
					if (ev.altKey) {
						ev.preventDefault();
						const form = formRef.current;
						if (!form) {
							return;
						}
						const formData = new FormData(form);
						setContent('');
						startTransition(async () => {
							await submitTranslation(formData);
							props.nextLocaleString?.();
						});
					} else if (ev.ctrlKey || ev.metaKey) {
						ev.preventDefault();
						formRef.current?.requestSubmit();
					}
				}}
			/>
			<div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-typo-secondary'>
				<span>
					<kbd className='px-1.5 py-0.5 rounded bg-black/20 font-mono'>
						{submitKey}+Enter
					</kbd>{' '}
					{t('to submit')}
				</span>
				<span>
					<kbd className='px-1.5 py-0.5 rounded bg-black/20 font-mono'>
						{nextKey}+Enter
					</kbd>{' '}
					{t('to submit & go to next string')}
				</span>
			</div>
			{qaIssues.length > 0 && (
				<div className='flex flex-col gap-1 rounded-md bg-black/20 px-3 py-2'>
					{qaIssues.map((issue, i) => (
						<div
							key={i}
							className={`flex items-start gap-2 text-sm ${
								issue.severity === 'error'
									? 'text-red-400'
									: 'text-yellow-400'
							}`}>
							<svg
								className='shrink-0 mt-0.5'
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.3 1.64 18.7 1.82 19C2 19.3 2.32 19.5 2.66 19.5H21.34C21.68 19.5 22 19.3 22.18 19C22.36 18.7 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.21 3.37 12.86 3.37C12.51 3.37 12.19 3.56 12.01 3.86H10.29Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
							<span>{issue.message}</span>
						</div>
					))}
				</div>
			)}
			<div className='flex justify-between items-center'>
				<div className='flex justify-start text-typo-secondary'>
					<button
						type='button'
						title={t('Use original string')}
						onClick={() => setContent(props.originalContent)}
						className='hover:text-typo-primary cursor-pointer h-6 w-10'>
						<svg
							width='100%'
							height='100%'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M7.5 3H14.6C16.8402 3 17.9603 3 18.816 3.43597C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C21 6.03969 21 7.15979 21 9.4V16.5M6.2 21H14.3C15.4201 21 15.9802 21 16.408 20.782C16.7843 20.5903 17.0903 20.2843 17.282 19.908C17.5 19.4802 17.5 18.9201 17.5 17.8V9.7C17.5 8.57989 17.5 8.01984 17.282 7.59202C17.0903 7.21569 16.7843 6.90973 16.408 6.71799C15.9802 6.5 15.4201 6.5 14.3 6.5H6.2C5.0799 6.5 4.51984 6.5 4.09202 6.71799C3.71569 6.90973 3.40973 7.21569 3.21799 7.59202C3 8.01984 3 8.57989 3 9.7V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21Z'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
					<button
						type='button'
						title={t('Clear text')}
						onClick={() => setContent('')}
						className='hover:text-typo-primary cursor-pointer h-6 w-10'>
						<svg
							width='100%'
							height='100%'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
					<button
						type='button'
						title={t('Grammar - OK')}
						className='hover:text-typo-primary cursor-pointer h-6 w-10'>
						<svg
							width='100%'
							height='100%'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</button>
				</div>
				<div className='flex items-center gap-4'>
					<div className='flex items-center gap-2 bg-black/15 px-3 py-1 rounded-xl'>
						{content.length}
						<span className='text-typo-secondary'>
							/ {props.maxLength || props.originalContent.length}
						</span>
					</div>
					<button
						type='submit'
						className='bg-highlight text-background px-6 py-2 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer flex items-center gap-2'>
						{t('Suggest')}
					</button>
				</div>
			</div>
		</form>
	);
},
);
