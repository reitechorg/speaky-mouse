import { useExtracted } from 'next-intl';
import { useState } from 'react';
import { SuggestStringAction } from '../actions/suggest';

export function SuggestionForm(props: {
	maxLength?: number | null;
	originalContent: string;
	id: string;
	language: string;
}) {
	const [content, setContent] = useState<string>('');
	const t = useExtracted();

	return (
		<form
			className='flex flex-col gap-2'
			action={SuggestStringAction}
			onSubmit={() => {
				setContent('');
			}}>
			<div className='text-typo-secondary text-sm uppercase font-semibold'>
				{t('Editor')}
			</div>
			<input type='hidden' name='locale-string-id' value={props.id} />
			<input type='hidden' name='language' value={props.language} />
			<textarea
				placeholder='Enter your translation here'
				className='outline-0 field-sizing-content resize-none min-h-20'
				value={content}
				name='content'
				onChange={(ev) => {
					setContent(ev.target.value);
				}}
			/>
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
}
