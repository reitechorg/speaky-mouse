import { NotFoundProject } from '@/app/ui/NotFoundPage';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { uploadFileAction } from './upload-file-action';
import { Modal } from '@/app/ui/Modal';
import { getExtracted } from 'next-intl/server';

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
			sourceFiles: true,
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
						<button className='text-primary hover:underline cursor-pointer'>
							+ {t('Add new source file')}
						</button>
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
						<div
							key={file.id}
							className='p-4 border border-primary/10 rounded-md flex flex-col gap-2'>
							<h3 className='text-typo-primary font-medium text-lg'>
								{file.title} ({file.parser})
							</h3>
							<form
								action={uploadFileAction}
								className='flex items-center gap-2'>
								<input
									type='hidden'
									name='fileId'
									value={file.id}
								/>
								<input
									type='file'
									name='file'
									accept='application/json'
								/>
								<button
									className='text-primary hover:underline cursor-pointer'
									type='submit'>
									{t('Upload new version')}
								</button>
							</form>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
