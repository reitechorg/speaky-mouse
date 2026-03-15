import { NotFoundProject } from '@/app/ui/NotFoundPage';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { langCodes } from '@/lib/lang-codes';
import Image from 'next/image';
import Link from 'next/link';
import { TranslationProgressBar } from '../../TranslationProgressBar';

export default async function ProjectPage({
	params,
}: {
	params: { projectSlug: string; targetLang: string };
}) {
	const { projectSlug, targetLang } = await params;
	const user = await getUser();

	const projectData = await db.project.findUnique({
		where: { slug: projectSlug },
		include: {
			sourceFiles: {
				where: {
					targetLanguages: {
						some: {
							language: targetLang,
						},
					},
				},
				include: {
					localeStrings: {
						include: {
							translations: {
								where: {
									language: targetLang,
								},
							},
						},
					},
				},
			},
			members: {
				where: {
					userId: user?.user.id,
				},
			},
		},
	});

	if (!projectData) {
		return <NotFoundProject />;
	}

	if (projectData.sourceFiles.length === 0) {
		return <NotFoundProject />;
	}

	const isMember = projectData.members.some(
		(member) => member.userId === user?.user.id,
	);
	const canViewProject = isMember || projectData.publicVisible;
	if (!canViewProject) {
		return <NotFoundProject />;
	}

	return (
		<div className='flex flex-col gap-2'>
			<Link
				href={`/project/${projectSlug}`}
				className='flex items-center gap-4'>
				{projectData.imageUrl && (
					<Image
						alt={projectData.title}
						width={512}
						height={512}
						className='h-24 w-24 object-cover rounded-md bg-white/10'
						src={projectData.imageUrl}
					/>
				)}
				<div className='flex flex-col gap-2'>
					<h1 className='text-4xl text-typo-primary font-semibold'>
						{projectData.title}
						<span className='text-typo-secondary font-normal ml-2 text-base'>
							{langCodes[targetLang as keyof typeof langCodes] ||
								targetLang}
						</span>
					</h1>
				</div>
			</Link>
			<div className='border-t border-primary/10 py-4 flex flex-col'>
				{projectData.sourceFiles.map((sourceFile) => (
					<Link
						href={`/edit/${sourceFile.id}/${targetLang}`}
						key={sourceFile.id}
						className='flex items-center text-typo-secondary py-2 hover:bg-white/5 hover:text-typo-primary cursor-pointer px-4 gap-2 rounded-md'>
						<div className='font-semibold'>{sourceFile.title}</div>
						<div className='bg-linear-0 to-accent from-accent/60 rounded-md text-background font-bold uppercase text-sm w-8 text-center ml-auto'>
							{sourceFile.sourceLanguage}
						</div>
						<div className='w-5 h-5 text-typo-secondary'>
							<svg
								width='100%'
								height='100%'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M6 17L11 12L6 7M13 17L18 12L13 7'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>
						</div>
						<div className='bg-linear-0 to-primary from-primary/60 rounded-md text-background font-bold uppercase text-sm w-8 text-center mr-4'>
							{targetLang}
						</div>
						<div className='w-100 mr-4'>
							<TranslationProgressBar
								translated={
									sourceFile.localeStrings.filter(
										(localeString) =>
											localeString.translations.some(
												(t) =>
													t.language === targetLang,
											),
									).length
								}
								approved={
									sourceFile.localeStrings.filter(
										(localeString) =>
											localeString.translations.some(
												(t) =>
													t.language === targetLang &&
													t.approvedAt,
											),
									).length
								}
								total={sourceFile.localeStrings.length}
							/>
						</div>
						<div className='flex items-center gap-4 rounded-md bg-black/20 py-1 text-center justify-center'>
							<div className='text-approved w-12 text-right'>
								{Math.round(
									(sourceFile.localeStrings.filter(
										(localeString) =>
											localeString.translations.some(
												(t) =>
													t.language === targetLang &&
													t.approvedAt,
											),
									).length /
										(sourceFile.localeStrings.length ||
											1)) *
										100,
								)}
								%
							</div>
							<div className='text-suggested w-12 text-left'>
								{Math.round(
									(sourceFile.localeStrings.filter(
										(localeString) =>
											localeString.translations.some(
												(t) =>
													t.language === targetLang,
											),
									).length /
										(sourceFile.localeStrings.length ||
											1)) *
										100,
								)}
								%
							</div>
						</div>
						<div className='text-typo-secondary w-25 text-right'>
							{sourceFile.localeStrings.length} strings
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
