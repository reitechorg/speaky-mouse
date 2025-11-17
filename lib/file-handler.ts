import { SourceFile } from "./generated/prisma/client";

export type FileHandler = {
	title: string;
	fileExtensions: string[];
	import: (sourceFile: SourceFile, fileContent: string) => Promise<void>;
	export: (
		sourceFile: SourceFile,
		languages?: string[],
	) => Promise<OutputFile[]>;
};

type OutputFile = {
	content: string;
	path: string;
};
