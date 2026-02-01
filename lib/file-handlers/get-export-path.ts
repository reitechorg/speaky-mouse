import { langCodes } from '../lang-codes';

export function getExportPath(
	template: string,
	ctx: {
		lang: string;
	},
): string {
	const placeholders: Record<string, string> = {
		language: langCodes[ctx.lang as keyof typeof langCodes] || ctx.lang,
		lang_code: ctx.lang,
	};

	for (const [key, value] of Object.entries(placeholders)) {
		template = template.replaceAll(`%${key}%`, value);
	}
	return template;
}
