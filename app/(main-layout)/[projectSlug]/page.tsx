import { NotFoundProject } from '@/app/ui/NotFoundPage';
import { db } from '@/lib/db';

export default async function ProjectPage({
	params,
}: {
	params: { projectSlug: string };
}) {
	const { projectSlug } = await params;
	const project = await db.project.findUnique({
		where: { slug: projectSlug },
		include: {
			defaultTargetLanguages: true,
		},
	});

	if (!project) {
		return <NotFoundProject />;
	}

	return (
		<div>
			{project.defaultTargetLanguages.map((lang) => (
				<div key={lang.projectId + '-' + lang.language}>
					{lang.language}
				</div>
			))}
		</div>
	);
}
