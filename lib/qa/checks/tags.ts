import { QaCheck, QaIssue } from '../types';

const TAG_RE = /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>/g;
const CDATA_RE = /<!\[CDATA\[/g;

function extractTags(text: string): string[] {
	return (text.match(TAG_RE) ?? []).sort();
}

export const checkTags: QaCheck = ({ source, translation }) => {
	const issues: QaIssue[] = [];

	const srcTags = extractTags(source);
	const trnTags = extractTags(translation);
	if (JSON.stringify(srcTags) !== JSON.stringify(trnTags)) {
		issues.push({
			checkType: 'tags_mismatch',
			severity: 'warning',
			message: 'HTML/XML tags in source and translation do not match.',
		});
	}

	const srcCdata = (source.match(CDATA_RE) ?? []).length;
	const trnCdata = (translation.match(CDATA_RE) ?? []).length;
	if (srcCdata !== trnCdata) {
		issues.push({
			checkType: 'tags_cdata',
			severity: 'warning',
			message: 'CDATA sections differ between source and translation.',
		});
	}

	return issues;
};
