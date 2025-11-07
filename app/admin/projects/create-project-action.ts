'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { langCodes } from '@/lib/lang-codes';
import { slugify } from '@/lib/utils/slug';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
	const user = await getUser();
	if (!user) {
		return;
	}

	const name = `${formData.get('name')}`.trim();
	const description = `${formData.get('description')}`.trim();
	const sourceLang = `${formData.get('sourceLanguage')}`.trim();

	if (name.length < 1 || name.length > 100) {
		return;
	}

	if (description.length > 500) {
		return;
	}

	if (
		sourceLang.length !== 2 ||
		Object.keys(langCodes).some((code) => code === sourceLang) === false
	) {
		return;
	}

	const project = await db.project.create({
		data: {
			title: name.trim(),
			description: description ? description.trim() : null,
			slug: slugify(name),
			defaultSourceLanguage: sourceLang?.trim() || 'en',
			members: {
				create: {
					role: 'OWNER',
					userId: user.user.id,
				},
			},
		},
	});

	redirect(`/${project.slug}/settings`);
}
