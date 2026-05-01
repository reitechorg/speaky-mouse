import { QaCheck, QaIssue } from '../types';

// Ordered from most specific to least to avoid double-matching
const VARIABLE_PATTERNS: RegExp[] = [
	/\{\{[^}]+\}\}/g, // {{variable}}
	/\{[^}]+\}/g, // {variable}
	/%\([^)]+\)[sdf]/g, // %(variable)s
	/%[0-9]+\$[sdf]/g, // %1$s
	/%[sdf]/g, // %s %d %f
];

function extractVariables(text: string): string[] {
	const found = new Set<string>();
	let remaining = text;
	for (const pattern of VARIABLE_PATTERNS) {
		const matches = remaining.match(pattern) ?? [];
		matches.forEach((m) => found.add(m));
		remaining = remaining.replace(pattern, '');
	}
	return [...found].sort();
}

export const checkVariables: QaCheck = ({ source, translation }) => {
	const srcVars = extractVariables(source);
	if (srcVars.length === 0) return [];

	const trnVars = extractVariables(translation);
	const missing = srcVars.filter((v) => !trnVars.includes(v));
	const extra = trnVars.filter((v) => !srcVars.includes(v));

	const issues: QaIssue[] = [];
	if (missing.length > 0) {
		issues.push({
			checkType: 'variables_missing',
			severity: 'error',
			message: `Missing variables in translation: ${missing.join(', ')}`,
		});
	}
	if (extra.length > 0) {
		issues.push({
			checkType: 'variables_extra',
			severity: 'warning',
			message: `Extra variables in translation not present in source: ${extra.join(', ')}`,
		});
	}
	return issues;
};
