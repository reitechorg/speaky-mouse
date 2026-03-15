import z from 'zod';

export enum FileParser {
	Json = 'Json',
	UnityCsv = 'UnityCsv',
}

export const fileParserSchema = z.enum(FileParser);
