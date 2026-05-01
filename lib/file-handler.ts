import { SourceFile } from './generated/prisma/client';

export type TranslationConflictMode = 'OVERWRITE' | 'SKIP_EXISTING' | 'SKIP_APPROVED';

export type ImportTranslationsOptions = {
	language: string;
	conflictMode: TranslationConflictMode;
	autoApprove: boolean;
	userId: string;
};

export type ImportTranslationsResult = {
	imported: number;
	skipped: number;
	notFound: number;
};

export type FileHandler = {
	title: string;
	fileExtensions: string[];
	import: (sourceFile: SourceFile, fileContent: string) => Promise<void>;
	importTranslations: (
		sourceFile: SourceFile,
		fileContent: string,
		options: ImportTranslationsOptions,
	) => Promise<ImportTranslationsResult>;
	export: (
		sourceFile: SourceFile,
		languages?: string[],
	) => Promise<OutputFile[]>;
};

export type OutputFile = {
	content: string;
	path: string;
};
