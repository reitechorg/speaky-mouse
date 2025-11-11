import { SuggestionForm } from './SuggestionForm';

export function EditorCore() {
	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center w-full justify-between'>
					<div className='text-typo-secondary text-sm uppercase font-semibold'>
						Source string
					</div>
					<div className='flex justify-end text-typo-secondary'>
						<button className='hover:text-typo-primary cursor-pointer h-6 w-10'>
							<svg
								width='100%'
								height='100%'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M12 20V4M12 4L6 10M12 4L18 10'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
						<button className='hover:text-typo-primary cursor-pointer h-6 w-10'>
							<svg
								width='100%'
								height='100%'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M12 5V19M12 19L19 12M12 19L5 12'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
						<button className='hover:text-typo-primary cursor-pointer h-6 w-10'>
							<svg
								width='100%'
								height='100%'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M21 18L19.9999 19.094C19.4695 19.6741 18.7502 20 18.0002 20C17.2501 20 16.5308 19.6741 16.0004 19.094C15.4693 18.5151 14.75 18.1901 14.0002 18.1901C13.2504 18.1901 12.5312 18.5151 12 19.094M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
						<button className='hover:text-typo-primary cursor-pointer h-6 w-10'>
							<svg
								width='100%'
								height='100%'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
								<path
									d='M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</button>
					</div>
				</div>
				<div>Text lol</div>
			</div>

			<SuggestionForm />

			<div className='flex flex-col gap-2'>
				<div className='text-typo-secondary text-sm uppercase font-semibold'>
					Translations
				</div>
				<div className='font-light'>No translations yet.</div>
			</div>
		</div>
	);
}
