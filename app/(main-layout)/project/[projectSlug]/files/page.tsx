import { NotFoundProject } from '@/app/ui/NotFoundPage';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getExtracted } from 'next-intl/server';
import { CreateSourceFileModal } from './CreateSourceFileModal';
import { SourceFileCard } from './SourceFileCard';

export default async function ProjectFilesPage({
	params,
}: {
	params: { projectSlug: string };
}) {
	const { projectSlug } = await params;
	const user = await getUser();
	const t = await getExtracted();

	if (!user) {
		redirect(`/login?back=/project/${projectSlug}/files`);
	}

	const project = await db.project.findUnique({
		where: {
			slug: projectSlug,
		},
		include: {
			sourceFiles: {
				include: { targetLanguages: true },
			},
			defaultTargetLanguages: true,
			members: {
				where: {
					userId: user.user.id,
				},
			},
		},
	});

	if (!project) {
		return <NotFoundProject />;
	}

	const membership = project.members.find(
		(member) => member.userId === user.user.id,
	);

	const allowedRoles = ['ADMIN', 'OWNER'];

	const canView = !!membership && allowedRoles.includes(membership.role);

	if (!canView) {
		return <NotFoundProject />;
	}

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
						unoptimized
					/>
				)}
				<div className='flex flex-col gap-2'>
					<h1 className='text-4xl text-typo-primary font-semibold'>
						{project.title}
					</h1>
					<div className='flex gap-2 items-center pb-2'>
						<Link
							href={`/project/${projectSlug}`}
							className='text-primary hover:underline'>
							{t('Translate')}
						</Link>
						<Link
							href={`/project/${projectSlug}/files`}
							className='text-primary hover:underline'>
							{t('Files')}
						</Link>
						<Link
							href={`/project/${projectSlug}/settings`}
							className='text-primary hover:underline'>
							{t('Settings')}
						</Link>
					</div>
				</div>
			</div>
			<div className='border-t border-primary/10 py-4 flex flex-col'>
				<div className='flex items-center justify-between'>
					<h2 className='text-typo-primary text-xl'>
						{t('Source files')}
					</h2>
					<div className='flex items-end'>
						<CreateSourceFileModal
							projectSlug={projectSlug}
							defaultSourceLanguage={
								project.defaultSourceLanguage
							}
							defaultTargetLanguages={project.defaultTargetLanguages.map(
								(l) => l.language,
							)}
						/>
					</div>
				</div>
				<div className='mt-4 flex flex-col gap-4'>
					{project.sourceFiles.length === 0 && (
						<p className='text-typo-secondary'>
							{t(
								'No source files have been added to this project',
							)}
						</p>
					)}
					{project.sourceFiles.map((file) => (
						<SourceFileCard
							key={file.id}
							file={file}
							targetLanguages={file.targetLanguages.map(
								(l) => l.language,
							)}
							projectSlug={projectSlug}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
