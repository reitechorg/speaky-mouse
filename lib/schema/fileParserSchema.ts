import z from 'zod';

export enum FileParser {
	Json = 'Json',
	// Csv = 'Csv',
}

export const fileParserSchema = z.enum(FileParser);
