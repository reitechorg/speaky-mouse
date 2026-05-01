import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { admin, genericOAuth } from 'better-auth/plugins';
import { authConfig } from './auth-config';

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'mysql',
	}),
	emailAndPassword: {
		enabled: authConfig.enableEmailLogin,
	},
	socialProviders: authConfig.socialProviders,
	plugins: [
		nextCookies(),
		admin(),
		genericOAuth({
			config: authConfig.genericOAuthProviders,
		}),
	],
	trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS
		? process.env.AUTH_TRUSTED_ORIGINS.split(',').map((o) => o.trim())
		: ['http://localhost:3000'],
});

export const getUser = async () => {
	return await auth.api.getSession({
		headers: await headers(),
	});
};
