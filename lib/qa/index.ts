import { QaCheck, QaCheckContext, QaIssue } from './types';
import { checkEmpty } from './checks/empty';
import { checkLength } from './checks/length';
import { checkTags } from './checks/tags';
import { checkSpaces } from './checks/spaces';
import { checkVariables } from './checks/variables';
import { checkPunctuation } from './checks/punctuation';
import { checkCase } from './checks/case';
import { checkSpecial } from './checks/special';
import { checkNumbers } from './checks/numbers';

export type { QaIssue, QaSeverity } from './types';

export const defaultChecks: QaCheck[] = [
	checkEmpty,
	checkLength,
	checkTags,
	checkSpaces,
	checkVariables,
	checkPunctuation,
	checkCase,
	checkSpecial,
	checkNumbers,
];

export function runQaChecks(
	source: string,
	translation: string,
	context?: Omit<QaCheckContext, 'source' | 'translation'>,
	checks: QaCheck[] = defaultChecks,
): QaIssue[] {
	const ctx: QaCheckContext = { source, translation, ...context };
	return checks.flatMap((check) => check(ctx));
}
