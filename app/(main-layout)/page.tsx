import Image from 'next/image';
import { redirect } from 'next/navigation';
import { canRunSetup } from '../setup/page';
import { Metadata } from 'next';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = {
	title: 'Speaky mouse - Open source translation tool',
};

export default async function Home() {
	const redirectToSetup = await canRunSetup();
	if (redirectToSetup) {
		redirect('/setup');
	}

	const user = await getUser();
	const projects = await db.project.findMany({
		where: {
			OR: [
				{ publicVisible: true },
				{
					members: {
						some: {
							userId: user?.user.id,
						},
					},
				},
			],
		},
		include: {
			members: {
				where: {
					userId: user?.user.id,
				},
			},
			_count: {
				select: {
					members: true,
				},
			},
		},
		orderBy: {
			members: {
				_count: 'desc',
			},
		},
	});

	const userPojects = projects.filter((project) =>
		project.members.some((member) => member.userId === user?.user.id),
	);

	const publicProjects = projects.filter((project) => project.publicVisible);

	return (
		<div className='flex flex-col gap-8'>
			<div>
				<div className='text-3xl font-bold text-typo-primary'>
					Welcome to Speaky Mouse
				</div>
				<div className='mt-4 text-typo-secondary'>
					An open source translation tool to help you manage your
					localization projects with ease.
				</div>
			</div>
			{userPojects.length > 0 && (
				<div className='border-t border-primary/10 pt-4'>
					<div className='text-xl font-bold text-typo-primary'>
						Your projects
					</div>
					<div className='grid grid-cols-5 gap-2 mt-4'>
						{userPojects.map((project) => (
							<ProjectCard
								key={project.id}
								title={project.title}
								slug={project.slug}
								sourceLang={project.defaultSourceLanguage}
								description={project.description || undefined}
								membersCount={project._count.members}
								imageUrl={
									project.imageUrl || '/icon-square.png'
								}
							/>
						))}
					</div>
				</div>
			)}
			<div className='border-t border-primary/10 pt-4'>
				<div className='text-xl font-bold text-typo-primary'>
					Public projects{' '}
					<span className='text-base text-typo-secondary font-normal'>
						on this instance
					</span>
				</div>
				<div className='grid grid-cols-5 gap-2 mt-4'>
					{publicProjects.length === 0 && (
						<div className='text-typo-secondary col-span-5'>
							No public projects available.
						</div>
					)}
					{publicProjects.map((project) => (
						<ProjectCard
							key={project.id}
							title={project.title}
							slug={project.slug}
							sourceLang={project.defaultSourceLanguage}
							description={project.description || undefined}
							membersCount={project._count.members}
							imageUrl={project.imageUrl || '/icon-square.png'}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function ProjectCard(props: {
	title: string;
	slug: string;
	sourceLang?: string;
	description?: string;
	membersCount?: number;
	imageUrl?: string;
}) {
	return (
		<div className='p-4 flex flex-col border border-primary/10 rounded-2xl gap-4 bg-black/5'>
			<div className='flex gap-4 items-center'>
				{props.imageUrl && (
					<Image
						alt={props.title}
						width={64}
						height={64}
						className='w-12 h-12 object-scale-down bg-white/10 rounded-lg'
						src={props.imageUrl}
						unoptimized
					/>
				)}
				<div className='grow'>
					<div className='flex items-center justify-between'>
						<div className='font-semibold'>{props.title}</div>
						{props.sourceLang && (
							<div className='text-sm text-typo-secondary ml-auto'>
								{props.sourceLang}
							</div>
						)}
					</div>
					{props.membersCount && (
						<div className='text-sm text-typo-secondary'>
							{props.membersCount} members
						</div>
					)}
				</div>
			</div>
			{props.description && (
				<div className='text-typo-secondary border-t border-primary/10 pt-2'>
					{props.description}
				</div>
			)}
			<a
				className='bg-white/10 hover:bg-white/15 text-center py-2 px-4 rounded-full'
				href={`/project/${props.slug}`}>
				Open project
			</a>
		</div>
	);
}
