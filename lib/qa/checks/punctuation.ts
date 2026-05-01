import { QaCheck, QaIssue } from '../types';

function terminalPunct(text: string): string {
	return text.trimEnd().match(/[.!?]$/)?.[0] ?? '';
}

export const checkPunctuation: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];

	const srcEnd = terminalPunct(source);
	const trnEnd = terminalPunct(translation);
	if (srcEnd !== trnEnd) {
		issues.push({
			checkType: 'punctuation_terminal',
			severity: 'warning',
			message: `Terminal punctuation mismatch: source ends with "${srcEnd || '(none)'}", translation ends with "${trnEnd || '(none)'}"`,
		});
	}

	// Warn on space-before-punctuation only if source doesn't have it
	if (/\s[,;!?.]/.test(translation) && !/\s[,;!?.]/.test(source)) {
		issues.push({
			checkType: 'punctuation_space_before',
			severity: 'warning',
			message: 'Translation has unexpected spaces before punctuation marks.',
		});
	}

	return issues;
};
