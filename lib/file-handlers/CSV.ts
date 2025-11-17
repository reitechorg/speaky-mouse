import { FileHandler } from "../file-handler";
import { SourceFile } from "../generated/prisma/client";

export const CSVhandler: FileHandler = {
	title: "CSV",
	fileExtensions: ["csv"],
	import: importFunc,
	export: exportFunc,
};

async function importFunc(sourceFile: SourceFile, fileContent: string) {
	const lines = fileContent.split("\n");

	const hasComments = lines[0].toLowerCase().includes("comment");

	console.log(hasComments);
}

async function exportFunc(sourceFile: SourceFile, languages?: string[]) {
	return [];
}
