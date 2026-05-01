import { QaCheck, QaIssue } from '../types';

function isUpperCase(ch: string): boolean {
	return ch === ch.toUpperCase() && ch !== ch.toLowerCase();
}

export const checkCase: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];

	const srcFirst = source.trimStart()[0];
	const trnFirst = translation.trimStart()[0];

	if (srcFirst && trnFirst) {
		const srcUpper = isUpperCase(srcFirst);
		const trnUpper = isUpperCase(trnFirst);
		if (srcUpper !== trnUpper) {
			issues.push({
				checkType: 'case_initial',
				severity: 'warning',
				message: `Initial letter case mismatch: source starts with ${srcUpper ? 'uppercase' : 'lowercase'}, translation starts with ${trnUpper ? 'uppercase' : 'lowercase'}.`,
			});
		}
	}

	const srcCapsCount = (source.match(/\b[A-Z]{2,}\b/g) ?? []).length;
	const trnCapsCount = (translation.match(/\b[A-Z]{2,}\b/g) ?? []).length;
	if (trnCapsCount > srcCapsCount + 1) {
		issues.push({
			checkType: 'case_allcaps',
			severity: 'warning',
			message: 'Translation contains unexpected all-caps words not present in source.',
		});
	}

	return issues;
};
