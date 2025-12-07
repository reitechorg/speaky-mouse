import { db } from '../db';
import { FileHandler } from '../file-handler';
import { encodeTreeKey } from '../utils/key-encode';

function flattenJsonObject(
	obj: Record<string, unknown>,
	path: string[] = [],
): [string, string][] {
	const entries: [string, string][] = [];

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = encodeTreeKey(...path, key);

		if (typeof value === 'object' && value !== null) {
			const nestedRecords = flattenJsonObject(
				value as Record<string, unknown>,
				[...path, key],
			);
			entries.push(...nestedRecords);
		} else {
			entries.push([fullKey, `${value}`]);
		}
	}

	return entries;
}

export const jsonFileHandler: FileHandler = {
	title: 'JSON',
	fileExtensions: ['json'],
	export: async (sourceFile, languages) => {
		throw new Error('Not implemented yet');
	},
	import: async (sourceFile, fileContent) => {
		const data = JSON.parse(fileContent);

		await db.$transaction(async (tx) => {
			const usedKeys = new Set<string>();
			for (const [key, value] of flattenJsonObject(data)) {
				usedKeys.add(key);
				await tx.localeString.upsert({
					where: {
						sourceFileId_key: {
							sourceFileId: sourceFile.id,
							key: key,
						},
					},
					update: {
						content: value,
					},
					create: {
						sourceFileId: sourceFile.id,
						key: key,
						content: value,
					},
				});
			}

			// Remove unused keys
			await tx.localeString.deleteMany({
				where: {
					sourceFileId: sourceFile.id,
					key: {
						notIn: Array.from(usedKeys),
					},
				},
			});
		});
	},
};
