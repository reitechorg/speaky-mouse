import { configDotenv } from 'dotenv';
import { defineConfig } from 'prisma/config';
configDotenv();

export default defineConfig({
	schema: 'prisma/',
	migrations: {
		path: 'prisma/migrations',
	},
	engine: 'classic',
	datasource: {
		url: process.env.DATABASE_URL!, // env('DATABASE_URL'),
	},
});
