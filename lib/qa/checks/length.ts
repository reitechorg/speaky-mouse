import { QaCheck, QaIssue } from '../types';

export const checkLength: QaCheck = ({ translation, maxLength }) => {
	if (!maxLength) return [];
	if (translation.length > maxLength) {
		return [
			{
				checkType: 'length',
				severity: 'warning',
				message: `Translation is ${translation.length} characters, exceeding the limit of ${maxLength}.`,
			},
		];
	}
	return [];
};
