import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { CreateNewProjectModal } from './CreateNewProjectModal';
import { getExtracted } from 'next-intl/server';

export default async function ManageUsersPage() {
	const t = await getExtracted();
	const projects = await db.project.findMany({
		include: {
			_count: {
				select: {
					members: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-typo-primary font-semibold text-2xl'>
						{t('Project management')}
					</h1>
					<p className='text-typo-secondary'>
						{t('Here you can manage all projects')}
					</p>
				</div>
				<div>
					<CreateNewProjectModal />
				</div>
			</div>
			<div className='grid grid-cols-5 gap-2'>
				{projects.map((project) => (
					<div
						key={project.id}
						className='p-4 flex flex-col border border-zinc-800 rounded-2xl gap-4'>
						<div className='flex gap-4 items-center'>
							<Image
								width={48}
								height={48}
								src={project.imageUrl || '/icon.webp'}
								alt='Project Icon'
								className='w-12 h-12 object-scale-down bg-white/10 rounded-lg'
							/>
							<div className='grow'>
								<div className='flex items-center justify-between'>
									<div className='font-semibold'>
										{project.title}
									</div>
									<div className='text-sm text-typo-secondary ml-auto'>
										{project.defaultSourceLanguage}
									</div>
								</div>
								<div className='text-sm text-typo-secondary'>
									{project._count.members} members
								</div>
							</div>
						</div>
						{project.description && (
							<div className='text-typo-secondary border-t border-zinc-800 pt-2'>
								{project.description}
							</div>
						)}
						<Link
							href={`/project/${project.slug}`}
							className='bg-white/10 hover:bg-white/15 text-center py-2 px-4 rounded-full'>
							{t('Open project')}
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
