import Image from 'next/image';
import { LocaleString } from '../Editor';
import { SuggestionForm } from './SuggestionForm';
import Link from 'next/link';
import { useExtracted, useFormatter } from 'next-intl';
import { ProjectRole } from '@/lib/generated/prisma/enums';
import { ApproveTranslation, DeleteTranslations } from '../actions/suggest';

export function EditorCore(props: {
	localeString: LocaleString;
	language: string;
	userId: string;
	userRole: ProjectRole;
	prevLocaleString?: () => void;
	nextLocaleString?: () => void;
}) {
	const format = useFormatter();
	const t = useExtracted();
	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center w-full justify-between'>
					<div className='text-typo-secondary text-sm uppercase font-semibold'>
						{t('Source string')}
					</div>
					<div className='flex justify-end text-typo-secondary'>
						{props.prevLocaleString && (
							<button
								title={t('Previous string')}
								onClick={props.prevLocaleString}
								className='hover:text-typo-primary cursor-pointer h-6 w-10'>
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
						)}
						{props.nextLocaleString && (
							<button
								title={t('Next string')}
								onClick={props.nextLocaleString}
								className='hover:text-typo-primary cursor-pointer h-6 w-10'>
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
						)}
						{!props.nextLocaleString && props.prevLocaleString && (
							<div className='w-10 h-6' />
						)}
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
				<div>{props.localeString.content}</div>
			</div>

			<SuggestionForm
				id={props.localeString.id}
				maxLength={props.localeString.maxLength}
				originalContent={props.localeString.content}
				language={props.language}
			/>

			<div className='flex flex-col gap-2'>
				<div className='text-typo-secondary text-sm uppercase font-semibold mb-2'>
					{t('Translations')}
				</div>
				{props.localeString.translations.length === 0 && (
					<div className='font-light'>
						{t('No translations yet.')}
					</div>
				)}
				<div className='flex flex-col gap-4'>
					{props.localeString.translations.map((translation) => (
						<div
							key={translation.id}
							className='flex border-b border-typo-secondary/10 pb-4 last-of-type:border-b-0 items-start'>
							<div className='flex flex-col gap-2'>
								<div>{translation.content}</div>
								<div className='flex items-center gap-1'>
									<Image
										src={
											translation.author.image ||
											'/icon-square.png'
										}
										alt={
											translation.author.name ||
											t('User Avatar')
										}
										className='w-6 h-6 rounded-full mr-2 object-cover'
										draggable={false}
										unoptimized
										width={64}
										height={64}
									/>
									<Link
										href={`/users/${translation.author.id}`}
										className='text-typo-secondary hover:text-typo-primary hover:underline'>
										{translation.author.name}
									</Link>
									<div className='text-typo-secondary ml-2 mr-1 text-sm'>
										{'•'}
									</div>
									<div className='text-typo-secondary text-sm'>
										{format.dateTime(
											new Date(translation.createdAt),
										)}
									</div>
									{translation.approvedAt && (
										<div className='text-approved text-sm flex items-center gap-1 ml-4'>
											<svg
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'>
												<path
													d='M20 6L9 17L4 12'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												/>
											</svg>
											{t('Approved by')}{' '}
											<Link
												href={`/users/${translation.approver?.id}`}
												className='underline hover:text-approved/60'>
												{translation.approver?.name}
											</Link>
										</div>
									)}
								</div>
							</div>
							<div className='flex gap-2 ml-auto'>
								{props.userRole !== ProjectRole.TRANSLATOR &&
									!translation.approvedAt && (
										<form action={ApproveTranslation}>
											<input
												type='hidden'
												name='translation-id'
												value={translation.id}
											/>
											<button
												title={t('Approve translation')}
												className='w-6 h-6 text-typo-secondary hover:text-approved cursor-pointer'>
												<svg
													width='100%'
													height='100%'
													viewBox='0 0 24 24'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'>
													<path
														d='M20 6L9 17L4 12'
														stroke='currentColor'
														strokeWidth='2'
														strokeLinecap='round'
														strokeLinejoin='round'
													/>
												</svg>
											</button>
										</form>
									)}
								{(props.userRole !== ProjectRole.TRANSLATOR ||
									(props.userId === translation.authorId &&
										!translation.approvedAt)) && (
									<form action={DeleteTranslations}>
										<input
											type='hidden'
											name='translation-id'
											value={translation.id}
										/>
										<button
											title={t('Delete translation')}
											className='w-6 h-6 text-typo-secondary hover:text-red-400 cursor-pointer'>
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
									</form>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
