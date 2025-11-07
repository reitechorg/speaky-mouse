import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { db } from './db';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';
import { admin } from 'better-auth/plugins';

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'mysql',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.AUTH_GITHUB_ID!,
			clientSecret: process.env.AUTH_GITHUB_SECRET!,
		},
	},
	plugins: [nextCookies(), admin()],
});

export const getUser = async () => {
	return await auth.api.getSession({
		headers: await headers(),
	});
};
