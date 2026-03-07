import { FileHandler } from '../file-handler';
import { FileParser } from '../schema/fileParserSchema';
import { jsonFileHandler } from './json';

const parsers: Record<FileParser, FileHandler> = {
	[FileParser.Json]: jsonFileHandler,
};

export function getFileHandler(handler: FileParser) {
	return parsers[handler];
}
