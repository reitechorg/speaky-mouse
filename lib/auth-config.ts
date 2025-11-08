import { SocialProviders } from 'better-auth/social-providers';

const socialProviders: SocialProvider<keyof SocialProviders>[] = [
	standardSocialProvider('discord'),
	standardSocialProvider('facebook'),
	standardSocialProvider('atlassian'),
	standardSocialProvider('google'),
	standardSocialProvider('huggingface'),
	standardSocialProvider('github'),
	standardSocialProvider('kick'),
	standardSocialProvider('kakao', { iconUrl: '/login-providers/kakao.png' }),
	standardSocialProvider('slack'),
	standardSocialProvider('notion'),
	standardSocialProvider('naver'),
	standardSocialProvider('tiktok'),
	standardSocialProvider('twitch'),
	standardSocialProvider('twitter', { title: 'Twitter / X' }),
	standardSocialProvider('dropbox'),
	standardSocialProvider('linear'),
	standardSocialProvider('reddit'),
	standardSocialProvider('roblox'),
	standardSocialProvider('spotify'),
	standardSocialProvider('linkedin'),
	standardSocialProvider('line'),
	{
		key: 'microsoft',
		iconUrl: '/login-providers/microsoft.svg',
		title: 'Microsoft',
		enabled() {
			const id = process.env.AUTH_MICROSOFT_ID;
			const secret = process.env.AUTH_MICROSOFT_SECRET;
			return !!id && !!secret;
		},
		createProvider() {
			return {
				microsoft: {
					clientId: process.env.AUTH_MICROSOFT_ID!,
					clientSecret: process.env.AUTH_MICROSOFT_SECRET!,

					// Optional
					tenantId: process.env.AUTH_MICROSOFT_TENANT_ID,
					authority: process.env.AUTH_MICROSOFT_AUTHORITY,
					prompt: envParseEnum(process.env.AUTH_MICROSOFT_PROMPT, [
						'select_account',
						'consent',
						'login',
						'none',
						'select_account consent',
					]),
				},
			};
		},
	},
	{
		key: 'paypal',
		title: 'PayPal',
		iconUrl: '/login-providers/paypal.svg',
		enabled() {
			const id = process.env.AUTH_PAYPAL_ID;
			const secret = process.env.AUTH_PAYPAL_SECRET;
			return !!id && !!secret;
		},
		createProvider() {
			return {
				paypal: {
					clientId: process.env.AUTH_PAYPAL_ID!,
					clientSecret: process.env.AUTH_PAYPAL_SECRET!,
					environment: envParseEnum(
						process.env.AUTH_PAYPAL_ENV,
						['sandbox', 'live'],
						'sandbox',
					),
				},
			};
		},
	},
	{
		key: 'salesforce',
		title: 'Salesforce',
		iconUrl: '/login-providers/salesforce.svg',
		enabled() {
			const id = process.env.AUTH_SALESFORCE_ID;
			const secret = process.env.AUTH_SALESFORCE_SECRET;
			return !!id && !!secret;
		},
		createProvider() {
			return {
				salesforce: {
					clientId: process.env.AUTH_SALESFORCE_ID!,
					clientSecret: process.env.AUTH_SALESFORCE_SECRET!,
					environment: envParseEnum(
						process.env.AUTH_SALESFORCE_ENV,
						['sandbox', 'production'],
						'sandbox',
					),
				},
			};
		},
	},
	{
		key: 'gitlab',
		title: 'GitLab',
		iconUrl: '/login-providers/gitlab.svg',
		enabled() {
			const id = process.env.AUTH_GITLAB_ID;
			const secret = process.env.AUTH_GITLAB_SECRET;
			return !!id && !!secret;
		},
		createProvider() {
			return {
				gitlab: {
					clientId: process.env.AUTH_GITLAB_ID!,
					clientSecret: process.env.AUTH_GITLAB_SECRET!,

					// Optional
					issuer: process.env.AUTH_GITLAB_ISSUER, // GitLab instance URL
				},
			};
		},
	},
	{
		key: 'cognito',
		title: process.env.AUTH_COGNITO_TITLE || 'Cognito',
		iconUrl:
			process.env.AUTH_COGNITO_ICON_URL || '/login-providers/aws.svg',
		enabled() {
			return (
				!!process.env.AUTH_COGNITO_ID &&
				!!process.env.AUTH_COGNITO_SECRET &&
				!!process.env.AUTH_COGNITO_USER_POOL_ID &&
				!!process.env.AUTH_COGNITO_DOMAIN &&
				!!process.env.AUTH_COGNITO_REGION
			);
		},
		createProvider() {
			return {
				cognito: {
					clientId: process.env.AUTH_COGNITO_ID!,
					clientSecret: process.env.AUTH_COGNITO_SECRET!,
					domain: process.env.AUTH_COGNITO_DOMAIN!,
					region: process.env.AUTH_COGNITO_REGION!,
					userPoolId: process.env.AUTH_COGNITO_USER_POOL_ID!,
				},
			};
		},
	},
	{
		key: 'figma',
		title: 'Figma',
		iconUrl: '/login-providers/figma.svg',
		enabled() {
			const id = process.env.AUTH_FIGMA_ID;
			const secret = process.env.AUTH_FIGMA_SECRET;
			const clientKey = process.env.AUTH_FIGMA_CLIENT_KEY;
			return !!id && !!secret && !!clientKey;
		},
		createProvider() {
			return {
				figma: {
					clientId: process.env.AUTH_FIGMA_ID!,
					clientSecret: process.env.AUTH_FIGMA_SECRET!,
					clientKey: process.env.AUTH_FIGMA_CLIENT_KEY!,
				},
			};
		},
	},
	{
		key: 'apple',
		title: 'Apple ID',
		iconUrl: '/login-providers/apple.svg',
		enabled() {
			const id = process.env.AUTH_APPLE_ID;
			const secret = process.env.AUTH_APPLE_SECRET;
			return !!id && !!secret;
		},
		createProvider() {
			return {
				apple: {
					clientId: process.env.AUTH_APPLE_ID!,
					clientSecret: process.env.AUTH_APPLE_SECRET!,

					// Optional
					appBundleIdentifier: process.env.AUTH_APPLE_BUNDLE_ID,
				},
			};
		},
	},
];

type SocialProvider<T extends keyof SocialProviders> = {
	key: T;
	title: string;
	iconUrl?: string;
	enabled: () => boolean;
	createProvider: () => SocialProviders;
};

function standardSocialProvider<T extends keyof SocialProviders>(
	key: T,
	options?: {
		title?: string;
		iconUrl?: string;
	},
): SocialProvider<T> {
	const envKey = `AUTH_${key.toUpperCase()}_ID`;
	const envSecret = `AUTH_${key.toUpperCase()}_SECRET`;
	const id = process.env[envKey];
	const secret = process.env[envSecret];

	return {
		key,
		title:
			options?.title ||
			`${key.charAt(0).toUpperCase() + key.substring(1).toLowerCase()}`,
		iconUrl: options?.iconUrl || `/login-providers/${key}.svg`,
		enabled() {
			return !!id && !!secret;
		},
		createProvider() {
			return {
				[key]: {
					clientId: id!,
					clientSecret: secret!,
				},
			};
		},
	};
}

function envParseBool(
	value: string | undefined,
	defaultValue: boolean,
): boolean {
	if (value === undefined) return defaultValue;
	const trueValues = ['1', 'true', 'yes', 'on'];
	if (trueValues.includes(value.toLowerCase())) return true;
	return false;
}

function envParseEnum<T>(
	value: string | undefined,
	options: T[],
	defaultValue: T,
): T;
function envParseEnum<T>(value: string | undefined, options: T[]): undefined;
function envParseEnum<T>(
	value: string | undefined,
	options: T[],
	defaultValue?: T,
): T | undefined {
	if (value === undefined) return defaultValue;
	for (const option of options) {
		if (option === value) return option;
	}
	return defaultValue;
}

type SocialButtonConfig = {
	key: string;
	title: string;
	iconUrl?: string;
};

function buildSocialProviderConfig() {
	const loginPageButtonConfig: SocialButtonConfig[] = [];
	const config: SocialProviders = {};
	for (const provider of socialProviders.sort((a, b) =>
		a.title.localeCompare(b.title),
	)) {
		if (provider.enabled()) {
			const providerHandler = provider.createProvider();
			Object.assign(config, providerHandler);
			loginPageButtonConfig.push({
				key: provider.key,
				title: provider.title,
				iconUrl: provider.iconUrl,
			});
		}
	}
	return {
		providers: config,
		buttons: loginPageButtonConfig,
	};
}

function buildAuthConfig() {
	const config = buildSocialProviderConfig();
	return {
		enableEmailLogin: !envParseBool(
			process.env.DISABLE_PASSWORD_LOGIN,
			false,
		),
		socialProviders: config.providers,
		loginButtons: config.buttons,
	};
}

export const authConfig = buildAuthConfig();
