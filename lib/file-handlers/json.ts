import { db } from '../db';
import { FileHandler, OutputFile } from '../file-handler';
import { decodeTreeKey, encodeTreeKey } from '../utils/key-encode';
import { getFallbackTranslation } from '../utils/translation-fallback';
import { getExportPath } from './get-export-path';

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
		const outputFiles: OutputFile[] = [];

		for (const language of languages || []) {
			const localeString = await db.localeString.findMany({
				where: {
					sourceFileId: sourceFile.id,
				},
				include: {
					translations: {
						where: {
							language: {
								in: languages,
							},
						},
					},
				},
			});

			const fileContentObj: Record<string, unknown> = {};

			for (const suggestion of localeString) {
				const translation = suggestion.translations.find(
					(t) => t.language === language && t.approvedAt !== null,
				);

				const translationContent = translation
					? translation.content
					: getFallbackTranslation(
							suggestion.key,
							suggestion.content,
							sourceFile.notTranslatedStringExportMode,
						);
				if (translationContent === undefined) {
					continue;
				}

				// Insert into nested object structure
				const pathParts = decodeTreeKey(suggestion.key);
				let currentObj = fileContentObj;
				for (let i = 0; i < pathParts.length; i++) {
					const part = pathParts[i];
					if (i === pathParts.length - 1) {
						// Last part, set the value
						currentObj[part] = translationContent;
					} else {
						// Intermediate part, ensure the object exists
						if (
							typeof currentObj[part] !== 'object' ||
							currentObj[part] === null ||
							currentObj[part] === undefined
						) {
							currentObj[part] = {};
						}
						currentObj = currentObj[part] as Record<
							string,
							unknown
						>;
					}
				}
			}

			const fileContent = JSON.stringify(fileContentObj, null, 2);

			outputFiles.push({
				content: fileContent,
				path: getExportPath(sourceFile.exportPath, { lang: language }),
			});
		}

		return outputFiles;
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
