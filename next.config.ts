import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	output: 'standalone',
	/* config options here */
};

const withNextIntl = createNextIntlPlugin({
	experimental: {
		messages: {
			path: './i18n/lang',
			format: 'json',
			locales: 'infer',
		},
		extract: {
			sourceLocale: 'en',
		},
		srcPath: './app',
	},
});
const configWithIntl = withNextIntl(nextConfig);
export default configWithIntl;
