'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getFileHandler } from '@/lib/file-handlers/get-handler';
import { checkPermission } from '@/lib/permissions/check';
import { FileParser } from '@/lib/schema/fileParserSchema';
import { langCodes } from '@/lib/lang-codes';
import { revalidatePath } from 'next/cache';

type CreateSourceFileState = { error: string | null; success?: boolean };

export async function createSourceFileAction(
	prevState: CreateSourceFileState,
	formData: FormData,
): Promise<CreateSourceFileState> {
	const user = await getUser();
	if (!user) return { error: 'NOT_LOGGED_IN' };

	const projectSlug = `${formData.get('projectSlug')}`.trim();
	const title = `${formData.get('title')}`.trim();
	const parser = `${formData.get('parser')}`.trim() as FileParser;
	const sourceLanguage = `${formData.get('sourceLanguage')}`.trim();
	const targetLanguagesRaw = formData.getAll('targetLanguages') as string[];

	if (title.length < 1) return { error: 'TITLE_TOO_SHORT' };
	if (!Object.values(FileParser).includes(parser)) {
		return { error: 'INVALID_PARSER' };
	}
	if (
		sourceLanguage.length !== 2 ||
		!Object.keys(langCodes).includes(sourceLanguage)
	) {
		return { error: 'INVALID_SOURCE_LANGUAGE' };
	}

	const targetLanguages = targetLanguagesRaw.filter(
		(lang) => lang.length === 2 && Object.keys(langCodes).includes(lang),
	);

	const project = await db.project.findUnique({
		where: { slug: projectSlug },
		include: { members: true, sourceFiles: true },
	});

	if (!project) return { error: 'PROJECT_NOT_FOUND' };

	if (
		!checkPermission(user.user, 'project', 'createSourceFile', {
			project,
			projectMembers: project.members,
		})
	) {
		return { error: 'UNAUTHORIZED' };
	}

	const alreadyExists = project.sourceFiles.some((f) => f.title === title);
	if (alreadyExists) return { error: 'TITLE_ALREADY_EXISTS' };

	const newFile = await db.sourceFile.create({
		data: {
			title,
			parser,
			sourceLanguage,
			projectId: project.id,
			importPath: title,
			exportPath: title,
			targetLanguages: {
				createMany: {
					skipDuplicates: true,
					data: targetLanguages.map((lang) => ({ language: lang })),
				},
			},
		},
	});

	const file = formData.get('file') as File | null;
	if (file && file.size > 0) {
		const content = await file.text();
		const handler = getFileHandler(parser);
		await handler.import(newFile, content);
	}

	revalidatePath(`/project/${projectSlug}/files`);
	return { error: null, success: true };
}
