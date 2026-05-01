import { QaCheck, QaIssue } from '../types';

export const checkSpaces: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];

	const srcLeading = source.match(/^\s+/)?.[0] ?? '';
	const trnLeading = translation.match(/^\s+/)?.[0] ?? '';
	if (srcLeading !== trnLeading) {
		issues.push({
			checkType: 'spaces_leading',
			severity: 'warning',
			message: 'Leading whitespace differs between source and translation.',
		});
	}

	const srcTrailing = source.match(/\s+$/)?.[0] ?? '';
	const trnTrailing = translation.match(/\s+$/)?.[0] ?? '';
	if (srcTrailing !== trnTrailing) {
		issues.push({
			checkType: 'spaces_trailing',
			severity: 'warning',
			message: 'Trailing whitespace differs between source and translation.',
		});
	}

	if (/  +/.test(translation)) {
		issues.push({
			checkType: 'spaces_multiple',
			severity: 'warning',
			message: 'Translation contains multiple consecutive spaces.',
		});
	}

	const srcNbsp = (source.match(/ /g) ?? []).length;
	const trnNbsp = (translation.match(/ /g) ?? []).length;
	if (srcNbsp !== trnNbsp) {
		issues.push({
			checkType: 'spaces_nbsp',
			severity: 'warning',
			message: 'Non-breaking space count differs between source and translation.',
		});
	}

	return issues;
};
