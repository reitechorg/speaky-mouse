import { FileHandler } from '../file-handler';
import { FileParser } from '../schema/fileParserSchema';
import { jsonFileHandler } from './json';
import { unityCsvHandler } from './unity-csv';

const parsers: Record<FileParser, FileHandler> = {
	[FileParser.Json]: jsonFileHandler,
	[FileParser.UnityCsv]: unityCsvHandler,
};

export function getFileHandler(handler: FileParser) {
	return parsers[handler];
}
