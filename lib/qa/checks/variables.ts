import { QaCheck, QaIssue } from '../types';

// Ordered from most specific to least to avoid double-matching
const VARIABLE_PATTERN = new RegExp(
	[
		/\{\{[^}]+\}\}/, // {{variable}}
		/\{[^}]+\}/, // {variable}
		/%\([^)]+\)[sdf]/, // %(variable)s
		/%[0-9]+\$[sdf]/, // %1$s
		/%[sdf]/, // %s %d %f
	]
		.map((r) => r.source)
		.join('|'),
	'g',
);

export type VariableSegment = {
	text: string;
	isVariable: boolean;
};

export function splitVariableSegments(text: string): VariableSegment[] {
	const segments: VariableSegment[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(VARIABLE_PATTERN)) {
		const index = match.index;
		if (index > lastIndex) {
			segments.push({
				text: text.slice(lastIndex, index),
				isVariable: false,
			});
		}
		segments.push({ text: match[0], isVariable: true });
		lastIndex = index + match[0].length;
	}

	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex), isVariable: false });
	}

	return segments;
}

export function extractVariables(text: string): string[] {
	const found = new Set<string>();
	for (const match of text.matchAll(VARIABLE_PATTERN)) {
		found.add(match[0]);
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
			severity: 'error',
			message: `Extra variables in translation not present in source: ${extra.join(', ')}`,
		});
	}
	return issues;
};
