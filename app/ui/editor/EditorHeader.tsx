import { LanguageFlag } from '@/app/(main-layout)/project/LanguageFlag';
import Image from 'next/image';
import Link from 'next/link';
// import Link from 'next/link';

export function EditorHeader(props: {
	projectImageUrl?: string | null;
	projectName: string;
	projectSlug: string;
	fileName: string;
	fileLanguage: string;
}) {
	return (
		<div className='flex justify-between items-center px-4 py-2'>
			<Link
				href={`/project/${props.projectSlug}/${props.fileLanguage}`}
				className='flex gap-4 items-center'>
				<Image
					src={props.projectImageUrl || '/icon.webp'}
					alt='Speaky Mouse Logo'
					width={64}
					height={64}
					className='w-10 h-10 object-scale-down'
					unoptimized
				/>
				<div>
					<div className='text-accent font-semibold'>
						{props.projectName || 'Speaky Mouse'}
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-4 h-4'>
							<LanguageFlag languageCode={props.fileLanguage} />
						</div>
						<div className='text-typo-secondary text-sm'>
							{props.fileName}
						</div>
					</div>
				</div>
			</Link>
			{/* <div className='flex gap-2 items-center'>
				<Link
					href='/auth/login'
					className='text-typo-secondary py-2 px-4 rounded-lg font-bold hover:bg-white/15 hover:text-white cursor-pointer'>
					Log in
				</Link>
				<Link
					href='/auth/login'
					className='bg-highlight text-white py-2 px-4 rounded-lg font-bold hover:bg-[#4e9192] cursor-pointer'>
					Sign up
				</Link>
			</div> */}
		</div>
	);
}
