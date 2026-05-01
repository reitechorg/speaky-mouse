export type QaSeverity = 'error' | 'warning';

export type QaIssue = {
	checkType: string;
	severity: QaSeverity;
	message: string;
};

export type QaCheckContext = {
	source: string;
	translation: string;
	maxLength?: number | null;
	targetLanguage?: string;
};

export type QaCheck = (context: QaCheckContext) => QaIssue[];
