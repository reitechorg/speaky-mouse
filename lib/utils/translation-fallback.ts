import { NotTranslatedExportMode } from '../generated/prisma/enums';

export const getFallbackTranslation = (
	key: string,
	original: string,
	mode: NotTranslatedExportMode,
) => {
	if (mode === 'EMPTY_STRING') {
		return '';
	}
	if (mode === 'FAIL_EXPORT') {
		throw new Error(`Missing translation for ${key}`);
	}
	if (mode === 'KEEP_ORIGINAL') {
		return original;
	}
	if (mode === 'SKIP_STRING') {
		return undefined;
	}
	return key;
};
