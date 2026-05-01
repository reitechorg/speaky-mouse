import { QaCheck, QaIssue } from '../types';

const NUMBER_RE = /\b\d+(?:[.,]\d+)*\b/g;

export const checkNumbers: QaCheck = ({ source, translation }) => {
	const srcNums = source.match(NUMBER_RE) ?? [];
	if (srcNums.length === 0) return [];

	const trnNums: string[] = translation.match(NUMBER_RE) ?? [];
	const missing = srcNums.filter((n) => !trnNums.includes(n));
	if (missing.length === 0) return [];

	return [
		{
			checkType: 'numbers_missing',
			severity: 'warning',
			message: `Numbers from source missing in translation: ${missing.join(', ')}`,
		},
	];
};
