import { db } from '../db';
import { FileHandler, OutputFile } from '../file-handler';
import { SourceFile } from '../generated/prisma/client';
import { getFallbackTranslation } from '../utils/translation-fallback';
import { getExportPath } from './get-export-path';

export const unityCsvHandler: FileHandler = {
	title: 'Unity CSV',
	fileExtensions: ['csv'],
	import: importFunc,
	export: exportFunc,
};

async function importFunc(sourceFile: SourceFile, fileContent: string) {
	const [firstLine, ...lines] = fileContent.split('\n');

	if (!firstLine) {
		throw new Error('Missing CSV headers');
	}

	const splitHeaders = firstLine.split(',');
	const headerMap: Record<number, string> = {};
	splitHeaders.forEach((header, index) => {
		const startBraceletPos = header.lastIndexOf('(');
		const endBraceletPos = header.lastIndexOf(')');
		if (startBraceletPos + 3 === endBraceletPos) {
			header = header.substring(startBraceletPos + 1, endBraceletPos);
		}

		headerMap[index] = header;
	});

	await db.$transaction(async (tx) => {
		const usedKeys = new Set<string>();

		for (const lineIndex in lines) {
			const line = lines[lineIndex];
			const splitLine = line
				.split(',')
				.map((item) => item.replace(/^"|"$/g, '').replace(/""/g, '"'));
			const obj: Record<string, string> = {};
			splitLine.forEach((value, index) => {
				obj[headerMap[index]] = value;
			});

			const { Key } = obj;
			if (!Key) {
				throw new Error(`Missing Key on line ${lineIndex}`);
			}

			usedKeys.add(Key);
			await tx.localeString.upsert({
				where: {
					sourceFileId_key: {
						sourceFileId: sourceFile.id,
						key: Key,
					},
				},
				update: {
					content: obj[sourceFile.sourceLanguage],
				},
				create: {
					sourceFileId: sourceFile.id,
					key: Key,
					content: obj[sourceFile.sourceLanguage],
				},
			});

			// Remove unused keys
			await tx.localeString.deleteMany({
				where: {
					sourceFileId: sourceFile.id,
					key: {
						notIn: Array.from(usedKeys),
					},
				},
			});
		}
	});
}

function escapeCSV(value: string): string {
	// Check if the value contains a comma, double quotes, or newline
	if (value.includes(',') || value.includes('"') || value.includes('\n')) {
		// Escape double quotes by doubling them and surround the value with double quotes
		return `"${value.replace(/"/g, '""')}"`;
	}
	// Return the value as is if no special characters are found
	return value;
}

async function exportFunc(sourceFile: SourceFile, languages?: string[]) {
	const fileData: Record<string, Record<string, string>> = {};
	const fileHeaders: string[] = ['Key'];

	for (const language of languages || []) {
		if (!fileHeaders.includes(language)) {
			fileHeaders.push(language);
		}

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

			const Key = suggestion.key;
			fileData[Key] = {
				...fileData[Key],
				Key,
				[language]: translationContent,
			};
		}
	}

	const fileLines: string[] = [];
	Object.values(fileData).map((localeString) => {
		fileLines.push(
			fileHeaders
				.map((header) => {
					return escapeCSV(localeString[header]);
				})
				.join(','),
		);
	});

	const fileContent = [fileHeaders.join(','), ...fileLines].join('\n');

	const outputFiles: OutputFile[] = [];
	const existingPaths = new Set<string>();
	for (const language of languages || []) {
		const path = getExportPath(sourceFile.exportPath, {
			lang: language,
		});
		if (existingPaths.has(path)) {
			continue;
		}
		existingPaths.add(path);

		outputFiles.push({
			content: fileContent,
			path,
		});
	}

	return outputFiles;
}
