import { Editor } from '@/app/ui/editor/Editor';
import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function EditStringPage({
	params,
}: {
	params: Promise<{
		sourceFileId: string;
		targetLang: string;
	}>;
}) {
	const { sourceFileId, targetLang } = await params;
	const user = await getUser();

	if (!user) {
		redirect(
			`/auth/login?back=${encodeURIComponent(
				`/edit/${sourceFileId}/${targetLang}`,
			)}`,
		);
	}

	const data = await db.sourceFile.findUnique({
		where: {
			id: sourceFileId,
			targetLanguages: {
				some: {
					language: targetLang,
				},
			},
		},
		include: {
			targetLanguages: true,
			project: {
				include: {
					members: {
						where: {
							userId: user.user.id,
						},
					},
				},
			},
			localeStrings: {
				include: {
					translations: {
						where: {
							language: targetLang,
						},
						include: {
							author: {
								select: {
									id: true,
									image: true,
									name: true,
								},
							},
							approver: {
								select: {
									id: true,
									image: true,
									name: true,
								},
							},
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
				},
			},
		},
	});

	if (!data) {
		return (
			<div>Source file not found or target language not supported.</div>
		);
	}

	const membership = data.project.members.find(
		(member) => member.userId === user.user.id,
	);
	const isMember = !!membership;

	if (!isMember && !data.project.publicJoin) {
		return <div>You do not have access to this source file.</div>;
	}

	if (!isMember) {
		return (
			<div className='container mx-auto mt-16 flex flex-col gap-2'>
				<div className='p-4 bg-black/10 text-typo-secondary rounded'>
					<h1 className='text-2xl font-bold text-typo-primary'>
						Join project?
					</h1>
					<div>
						You are about to join the project {'"'}
						<span className='font-semibold text-white'>
							{data.project.title}
						</span>
						{'"'}.
					</div>
					<div>
						By joining, you will be able to contribute translations
						and project will be added to your dashboard.
					</div>
					<div>
						You can leave the project at any time from your profile
						page.
					</div>
					<form action={joinProject}>
						<input
							type='hidden'
							name='projectId'
							value={data.project.id}
						/>
						<button className='mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold cursor-pointer'>
							Join Project
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<Editor file={data} language={targetLang} userId={membership.userId} />
	);
}

export async function joinProject(formData: FormData) {
	'use server';
	const projectId = formData.get('projectId') as string;
	const user = await getUser();

	if (!user) {
		redirect(
			`/auth/login?back=${encodeURIComponent(`/project/${projectId}`)}`,
		);
	}

	const project = await db.project.findUnique({
		where: {
			id: projectId,
		},
	});

	if (!project) {
		throw new Error('Project not found');
	}

	if (!project.publicJoin) {
		throw new Error('Project is not open for public joining');
	}

	await db.projectMember.create({
		data: {
			projectId: project.id,
			userId: user.user.id,
			role: 'TRANSLATOR',
		},
	});

	refresh();
}
