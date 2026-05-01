'use server';

import { getUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { langCodes } from '@/lib/lang-codes';
import { slugify } from '@/lib/utils/slug';

type CreateProjectResult = {
	error: string | null;
	project?: {
		id: string;
		slug: string;
	};
};

export async function createProject(
	previousState: CreateProjectResult,
	formData: FormData,
): Promise<CreateProjectResult> {
	const user = await getUser();
	if (!user) {
		return {
			error: 'NOT_LOGGED_IN',
		};
	}

	const name = `${formData.get('name')}`.trim();
	const description = `${formData.get('description')}`.trim();
	const sourceLang = `${formData.get('sourceLanguage')}`.trim();

	if (name.length < 1) {
		return {
			error: 'NAME_TOO_SHORT',
		};
	}

	if (name.length > 100) {
		return {
			error: 'NAME_TOO_LONG',
		};
	}

	if (description.length > 500) {
		return {
			error: 'DESCRIPTION_TOO_LONG',
		};
	}

	if (
		sourceLang.length !== 2 ||
		Object.keys(langCodes).some((code) => code === sourceLang) === false
	) {
		return {
			error: 'INVALID_SOURCE_LANGUAGE',
		};
	}

	const baseSlug = slugify(name);
	const existingSlugs = await db.project.findMany({
		where: { slug: { startsWith: baseSlug } },
		select: { slug: true },
	});
	const slugSet = new Set(existingSlugs.map((p) => p.slug));
	let slug = baseSlug;
	for (let i = 2; slugSet.has(slug); i++) {
		slug = `${baseSlug}-${i}`;
	}

	const project = await db.project.create({
		data: {
			title: name.trim(),
			description: description ? description.trim() : null,
			slug,
			defaultSourceLanguage: sourceLang?.trim() || 'en',
			members: {
				create: {
					role: 'OWNER',
					userId: user.user.id,
				},
			},
		},
	});

	return {
		error: null,
		project: {
			id: project.id,
			slug: project.slug,
		},
	};

	// redirect(`/project/${project.slug}/settings`);
}
