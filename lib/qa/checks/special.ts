import { QaCheck, QaIssue } from '../types';

const HTML_ENTITY_RE = /&(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);/g;

function bracketCount(text: string, ch: string): number {
	return (text.split(ch).length - 1);
}

export const checkSpecial: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];

	for (const [open, close] of [
		['(', ')'],
		['[', ']'],
		['{', '}'],
	] as const) {
		const srcOpen = bracketCount(source, open);
		const srcClose = bracketCount(source, close);
		const trnOpen = bracketCount(translation, open);
		const trnClose = bracketCount(translation, close);

		if (srcOpen !== trnOpen || srcClose !== trnClose) {
			issues.push({
				checkType: `special_brackets`,
				severity: 'warning',
				message: `Bracket mismatch "${open}${close}": source has ${srcOpen}/${srcClose}, translation has ${trnOpen}/${trnClose}.`,
			});
		}
	}

	const srcEntities = (source.match(HTML_ENTITY_RE) ?? []).sort();
	const trnEntities = (translation.match(HTML_ENTITY_RE) ?? []).sort();
	if (JSON.stringify(srcEntities) !== JSON.stringify(trnEntities)) {
		issues.push({
			checkType: 'special_entities',
			severity: 'warning',
			message: 'HTML entities differ between source and translation.',
		});
	}

	return issues;
};
