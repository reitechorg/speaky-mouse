import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/permissions/check';
import { getExtracted } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ProjectSettingsForm } from './ProjectSettingsForm';
import { MembersSection } from './MembersSection';
import { DeleteProjectButton } from './DeleteProjectButton';

export const metadata: Metadata = {
	title: 'Project Settings - Speaky mouse',
};

export default async function ProjectSettingsPage({
	params,
}: {
	params: { projectSlug: string };
}) {
	const { projectSlug } = await params;
	const t = await getExtracted();
	const user = await getUser();

	if (!user) {
		redirect(`/auth/login?back=/project/${projectSlug}/settings`);
	}

	const project = await db.project.findUnique({
		where: { slug: projectSlug },
		include: {
			defaultTargetLanguages: true,
			members: {
				include: {
					user: {
						select: { name: true, email: true, image: true },
					},
				},
			},
		},
	});

	if (!project) {
		notFound();
	}

	const canUpdate = checkPermission(user.user, 'project', 'update', {
		project,
		projectMembers: project.members,
	});

	if (!canUpdate) {
		notFound();
	}

	const canManageMembers = checkPermission(
		user.user,
		'project',
		'manageMembers',
		{ project, projectMembers: project.members },
	);

	const canDelete = checkPermission(user.user, 'project', 'delete', {
		project,
		projectMembers: project.members,
	});

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center gap-4 mb-4'>
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
							className='text-primary hover:underline font-semibold'>
							{t('Settings')}
						</Link>
					</div>
				</div>
			</div>

			<ProjectSettingsForm
				slug={projectSlug}
				title={project.title}
				description={project.description}
				imageUrl={project.imageUrl}
				publicVisible={project.publicVisible}
				publicJoin={project.publicJoin}
				publicDownload={project.publicDownload}
				defaultSourceLanguage={project.defaultSourceLanguage}
				defaultTargetLanguages={project.defaultTargetLanguages.map(
					(l) => l.language,
				)}
			/>

			{canManageMembers && (
				<MembersSection
					slug={projectSlug}
					members={project.members.map((m) => ({
						userId: m.userId,
						role: m.role,
						user: m.user,
					}))}
				/>
			)}

			{canDelete && (
				<div className='border border-red-900/50 rounded-md p-4 flex flex-col gap-3 mt-4'>
					<h2 className='font-semibold text-red-400'>
						{t('Danger zone')}
					</h2>
					<p className='text-typo-secondary text-sm'>
						{t(
							'Deleting the project will remove all source files, strings, and translations permanently.',
						)}
					</p>
					<DeleteProjectButton slug={projectSlug} />
				</div>
			)}
		</div>
	);
}
