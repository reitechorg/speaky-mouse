import { Metadata } from 'next';
import { getExtracted } from 'next-intl/server';
import { db } from '@/lib/db';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Admin Dashboard - Speaky mouse',
	description: 'Manage instance settings and projects',
};

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-1'>
			<div className='text-3xl font-semibold text-typo-primary'>
				{value.toLocaleString()}
			</div>
			<div className='text-typo-secondary text-sm'>{label}</div>
		</div>
	);
}

export default async function AdminPage() {
	const t = await getExtracted();

	const [projectCount, userCount, stringCount, approvedCount] =
		await db.$transaction([
			db.project.count(),
			db.user.count(),
			db.localeString.count(),
			db.translation.count({ where: { approvedAt: { not: null } } }),
		]);

	const recentActivity = await db.translation.findMany({
		take: 10,
		where: { approvedAt: { not: null } },
		orderBy: { approvedAt: 'desc' },
		include: {
			author: { select: { name: true } },
			localeString: {
				select: {
					key: true,
					sourceFile: {
						select: {
							title: true,
							project: { select: { title: true, slug: true } },
						},
					},
				},
			},
		},
	});

	const topProjects = await db.project.findMany({
		take: 5,
		include: {
			_count: { select: { sourceFiles: true, members: true } },
		},
		orderBy: { sourceFiles: { _count: 'desc' } },
	});

	return (
		<div className='flex flex-col gap-6'>
			<div>
				<h1 className='text-typo-primary font-semibold text-2xl'>
					{t('Overview')}
				</h1>
				<p className='text-typo-secondary'>
					{t('Platform-wide statistics and recent activity')}
				</p>
			</div>

			<div className='grid grid-cols-4 gap-4'>
				<StatCard label={t('Projects')} value={projectCount} />
				<StatCard label={t('Users')} value={userCount} />
				<StatCard label={t('Source strings')} value={stringCount} />
				<StatCard
					label={t('Approved translations')}
					value={approvedCount}
				/>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-3'>
					<h2 className='font-semibold text-typo-primary'>
						{t('Recent approvals')}
					</h2>
					{recentActivity.length === 0 && (
						<p className='text-typo-secondary text-sm'>
							{t('No activity yet')}
						</p>
					)}
					{recentActivity.map((item) => (
						<div
							key={item.id}
							className='text-sm border-b border-zinc-800 pb-2 flex flex-col gap-0.5'>
							<div className='text-typo-primary'>
								<span className='font-medium'>
									{item.author.name}
								</span>{' '}
								{t('approved a translation in')}{' '}
								<Link
									href={`/project/${item.localeString.sourceFile.project.slug}`}
									className='text-primary hover:underline'>
									{
										item.localeString.sourceFile.project
											.title
									}
								</Link>
							</div>
							<div className='text-typo-secondary text-xs'>
								{item.localeString.sourceFile.title} &rarr;{' '}
								{item.localeString.key}
							</div>
							<div className='text-typo-secondary text-xs'>
								{item.approvedAt?.toLocaleString()}
							</div>
						</div>
					))}
				</div>

				<div className='border border-zinc-800 rounded-xl p-4 flex flex-col gap-3'>
					<h2 className='font-semibold text-typo-primary'>
						{t('Top projects by source files')}
					</h2>
					{topProjects.length === 0 && (
						<p className='text-typo-secondary text-sm'>
							{t('No projects yet')}
						</p>
					)}
					<table className='w-full text-sm'>
						<thead>
							<tr className='text-typo-secondary'>
								<th className='text-left pb-2'>
									{t('Project')}
								</th>
								<th className='text-right pb-2'>
									{t('Files')}
								</th>
								<th className='text-right pb-2'>
									{t('Members')}
								</th>
							</tr>
						</thead>
						<tbody>
							{topProjects.map((project) => (
								<tr
									key={project.id}
									className='border-t border-zinc-800'>
									<td className='py-2'>
										<Link
											href={`/project/${project.slug}`}
											className='text-primary hover:underline'>
											{project.title}
										</Link>
									</td>
									<td className='py-2 text-right text-typo-secondary'>
										{project._count.sourceFiles}
									</td>
									<td className='py-2 text-right text-typo-secondary'>
										{project._count.members}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
