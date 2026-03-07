import z from 'zod';
import { fileParserSchema } from './fileParserSchema';
import { notTranslatedExportModeSchema } from './notTranslatedExportModeSchema';
import { NotTranslatedExportMode } from '../generated/prisma/enums';
import { languageSchema, projectLanguageSchema } from './languageSchema';

export const sourceFileBaseSchema = z.object({
	title: z.string().min(3),
	projectId: z.string(),

	importPath: z.string(),
	exportPath: z.string(),
	parser: fileParserSchema,

	notTranslatedStringExportMode: notTranslatedExportModeSchema.default(
		NotTranslatedExportMode.KEEP_ORIGINAL,
	),
});

export const sourceFileInputSchema = sourceFileBaseSchema.extend({
	sourceLanguage: languageSchema.optional(),
	targetLanguages: z.array(languageSchema).optional(),
});

export const sourceFileSchema = sourceFileBaseSchema.extend({
	id: z.string(),
	sourceLanguage: languageSchema,
	targetLanguages: z.array(projectLanguageSchema),
});
