import { QaCheck, QaIssue } from '../types';

export const checkEmpty: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];
	const srcEmpty = source.trim().length === 0;
	const trnEmpty = translation.trim().length === 0;

	if (!srcEmpty && trnEmpty) {
		issues.push({
			checkType: 'empty_translation',
			severity: 'error',
			message: 'Translation is empty but the source is not.',
		});
	}
	if (srcEmpty && !trnEmpty) {
		issues.push({
			checkType: 'empty_source',
			severity: 'warning',
			message: 'Source is empty but the translation is not.',
		});
	}
	return issues;
};
