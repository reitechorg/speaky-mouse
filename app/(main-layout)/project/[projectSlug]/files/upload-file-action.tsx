import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { FileParser, getFileHandler } from '@/lib/file-handlers/get-handler';
import { checkPermission } from '@/lib/permissions/check';

export async function uploadFileAction(formData: FormData) {
	'use server';

	const user = await getUser();

	const fileId = formData.get('fileId') as string;
	const file = formData.get('file') as File;

	const sourceFile = await db.sourceFile.findUnique({
		where: {
			id: fileId,
		},
		include: {
			project: {
				include: {
					members: true,
				},
			},
		},
	});

	if (!sourceFile) {
		throw new Error('Source file not found');
	}

	if (
		!checkPermission(user?.user, 'sourceFile', 'import', {
			projectMembers: sourceFile.project.members || [],
			sourceFile: sourceFile,
		})
	) {
		throw new Error('User is not authorized to import to this source file');
	}

	const fileContent = await file.text();

	if (!sourceFile.parser) {
		throw new Error('Source file parser not defined');
	}

	const parser = getFileHandler(sourceFile.parser as FileParser);

	await parser.import(sourceFile, fileContent);

	// console.log('Uploaded file content:', fileContent);
}
