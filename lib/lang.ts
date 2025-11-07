import { cookies, headers } from 'next/headers';
import { LangCode } from './lang-codes';

const DEFAULT_LANGUAGE = 'en';
const supportedBackendLanguages: LangCode[] = ['en', 'cs'];

export async function getLanguageCode() {
	const cookieStore = await cookies();
	const cookieLang = cookieStore.get('lang');

	if (
		cookieLang &&
		supportedBackendLanguages.includes(
			cookieLang.value.toLowerCase() as LangCode,
		)
	) {
		return cookieLang.value.toLowerCase();
	}

	const headerStore = await headers();
	const acceptLang = headerStore.get('Accept-Language');
	if (acceptLang) {
		const acceptedLanguages = acceptLang
			.split(',')
			.map((lang) => lang.split(';')[0].trim())
			.map((lang) => lang.toLowerCase())
			.map((lang) => lang.split('-')[0]); // consider only primary tag

		for (const lang of acceptedLanguages) {
			if (
				supportedBackendLanguages.includes(
					lang.toLowerCase() as LangCode,
				)
			) {
				return lang;
			}
		}
	}

	return DEFAULT_LANGUAGE;
}

export async function getTranslations() {
	const langCode = await getLanguageCode();
	const langDict = (await import(`../lang/${langCode}.json`)).default;
	return langDict as Record<string, string>;
}
