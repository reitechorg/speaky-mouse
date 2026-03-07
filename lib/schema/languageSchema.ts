import z from 'zod';
import { langCodes } from '../lang-codes';

export const languageSchema = z.enum(Object.keys(langCodes));

export const projectLanguageSchema = z.object({
	projectId: z.string(),
	language: languageSchema,
});
