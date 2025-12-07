import { jsonFileHandler } from './json';

export type FileParser = 'json' | 'csv';

export function getFileHandler(handler: FileParser) {
	switch (handler) {
		case 'json':
			return jsonFileHandler;
		default:
			throw new Error(`Unsupported file handler: ${handler}`);
	}
}
