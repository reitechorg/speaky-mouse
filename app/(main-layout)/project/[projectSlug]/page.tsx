import { NotFoundProject } from '@/app/ui/NotFoundPage';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { langCodes } from '@/lib/lang-codes';
import Image from 'next/image';
import Link from 'next/link';
import { TranslationProgressBar } from '../TranslationProgressBar';
import { LanguageFlag } from '../LanguageFlag';

export default async function ProjectPage({
	params,
}: {
	params: { projectSlug: string };
}) {
	const { projectSlug } = await params;
	const user = await getUser();

	const project = await db.project.findUnique({
		where: { slug: projectSlug },
		include: {
			defaultTargetLanguages: true,
			sourceFiles: {
				include: {
					targetLanguages: true,
					localeStrings: {
						include: {
							translations: true,
						},
					},
				},
			},
			_count: {
				select: {
					members: true,
				},
			},
			members: {
				where: {
					userId: user?.user.id,
				},
			},
		},
	});

	if (!project) {
		return <NotFoundProject />;
	}

	const membership = project.members.find(
		(member) => member.userId === user?.user.id,
	);
	const isMember = !!membership;
	const canViewProject = isMember || project.publicVisible;

	if (!canViewProject) {
		return <NotFoundProject />;
	}
	const sourceLanguagesSet = new Set<string>();
	const targetLanguagesSet = new Set<string>();
	project.sourceFiles.forEach((file) => {
		sourceLanguagesSet.add(file.sourceLanguage);
		file.targetLanguages.forEach((lang) => {
			targetLanguagesSet.add(lang.language);
		});
	});
	sourceLanguagesSet.add(project.defaultSourceLanguage);
	project.defaultTargetLanguages.forEach((lang) => {
		targetLanguagesSet.add(lang.language);
	});
	const targetLanguages = Array.from(targetLanguagesSet);
	const sourceLanguages = Array.from(sourceLanguagesSet);

	const targetLocaleDetailed = targetLanguages.map((lang) => {
		const { all, translated, approved } = project.sourceFiles.reduce(
			(accFile, sourceFile) => {
				const { all, translated, approved } =
					sourceFile.localeStrings.reduce(
						(accString, localeString) => {
							const translations =
								localeString.translations.filter(
									(t) => t.language === lang,
								);

							const isTranslated = translations.length > 0;
							const isApproved = translations.some(
								(t) => t.approvedAt,
							);
							accString.all += 1;
							if (isTranslated) {
								accString.translated += 1;
							}
							if (isApproved) {
								accString.approved += 1;
							}
							return accString;
						},
						{ all: 0, translated: 0, approved: 0 },
					);
				accFile.all += all;
				accFile.translated += translated;
				accFile.approved += approved;
				return accFile;
			},
			{ all: 0, translated: 0, approved: 0 },
		);

		return {
			langCode: lang,
			langName: langCodes[lang as keyof typeof langCodes] || lang,
			stringCount: all,
			translatedCount: translated,
			approvedCount: approved,
		};
	});

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center gap-4'>
				{project.imageUrl && (
					<Image
						alt={project.title}
						width={512}
						height={512}
						className='h-24 w-24 object-cover rounded-md bg-white/10'
						src={project.imageUrl}
					/>
				)}
				<div className='flex flex-col gap-2'>
					<h1 className='text-4xl text-typo-primary font-semibold'>
						{project.title}
						<span className='text-typo-secondary font-normal ml-2 text-base'>
							{project._count.members} members
						</span>
					</h1>
					<div className='flex gap-2 items-center pb-2'>
						{sourceLanguages.map((lang) => (
							<div
								key={lang}
								className='bg-linear-0 px-3 py-1 to-accent from-accent/60 rounded-md text-background font-bold uppercase text-sm'>
								{lang}
							</div>
						))}

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
						{targetLanguages.map((lang) => (
							<div
								key={lang}
								className='bg-linear-0 px-3 py-1 to-primary from-primary/60 rounded-md text-background font-bold uppercase text-sm'>
								{lang}
							</div>
						))}
					</div>
				</div>
			</div>
			<p className='text-typo-secondary'>{project.description}</p>
			{['ADMIN', 'OWNER'].includes(membership?.role || '') && (
				<div className='flex gap-2 items-center pb-2'>
					<Link
						href={`/project/${projectSlug}`}
						className='text-primary hover:underline'>
						Translate
					</Link>
					<Link
						href={`/project/${projectSlug}/files`}
						className='text-primary hover:underline'>
						Files
					</Link>
					<Link
						href={`/project/${projectSlug}/settings`}
						className='text-primary hover:underline'>
						Settings
					</Link>
				</div>
			)}
			<div className='border-t border-primary/10 py-4 flex flex-col'>
				{targetLocaleDetailed.map((locale) => (
					<Link
						href={`/project/${project.slug}/${locale.langCode}`}
						key={locale.langCode}
						className='flex items-center text-typo-secondary py-2 hover:bg-white/5 hover:text-typo-primary cursor-pointer px-4 gap-2 rounded-md'>
						{/* <div className='bg-linear-0 to-primary from-primary/60 rounded-md text-background font-bold uppercase text-sm w-8 text-center'>
							{locale.langCode}
						</div> */}
						<div className='w-6 h-6'>
							<LanguageFlag languageCode={locale.langCode} />
						</div>
						<div className='font-semibold'>{locale.langName}</div>
						<div className='ml-auto w-100 mr-4'>
							<TranslationProgressBar
								translated={locale.translatedCount}
								approved={locale.approvedCount}
								total={locale.stringCount || 0}
							/>
						</div>
						<div className='flex items-center gap-4 rounded-md bg-black/20 py-1 text-center justify-center'>
							<div className='text-approved w-12 text-right'>
								{Math.round(
									(locale.approvedCount /
										(locale.stringCount || 1)) *
										100,
								)}
								%
							</div>
							<div className='text-suggested w-12 text-left'>
								{Math.round(
									(locale.translatedCount /
										(locale.stringCount || 1)) *
										100,
								)}
								%
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
