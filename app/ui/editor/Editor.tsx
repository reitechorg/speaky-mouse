'use client';

import { ProjectRole } from '@/lib/generated/prisma/enums';
import { EditorHeader } from './EditorHeader';
import { LocaleStringList } from './LocaleStringList';
import { EditorCore } from './core/EditorCore';
import { useSearchParams } from 'next/navigation';

export type Translation = {
	id: string;
	language: string;
	content: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	approvedBy: string | null;
	approvedAt: Date | null;
	author: Author;
	approver?: Author | null;
};

export type Author = {
	id: string;
	image: string | null;
	name: string;
};

export type LocaleString = {
	id: string;
	content: string;
	key: string;
	maxLength: number | null;
	translations: Translation[];
};

type ProjectMember = {
	projectId: string;
	userId: string;
	createdAt: Date;
	updatedAt: Date;
	role: ProjectRole;
};

type SourceFile = {
	id: string;
	title: string;
	targetLanguages: {
		language: string;
	}[];
	localeStrings: LocaleString[];
	project: Project;
};

type Project = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	slug: string;
	title: string;
	description: string | null;
	imageUrl: string | null;
	publicVisible: boolean;
	publicJoin: boolean;
	publicDownload: boolean;
	defaultSourceLanguage: string;
	members: ProjectMember[];
};

export function Editor(props: {
	file: SourceFile;
	language: string;
	userId: string;
}) {
	const params = useSearchParams();
	const activeLocaleStringId =
		params.get('str') || props.file.localeStrings[0]?.id;
	const setActiveLocaleStringId = (id: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set('str', id);
		window.history.replaceState({}, '', url.toString());
	};

	const activeLocaleStringIndex = props.file.localeStrings.findIndex(
		(ls) => ls.id === activeLocaleStringId,
	);
	const activeLocaleString =
		props.file.localeStrings[activeLocaleStringIndex] || null;

	console.log('rerender Editor');

	const prevLocaleString =
		activeLocaleStringIndex > 0
			? () => {
					setActiveLocaleStringId(
						props.file.localeStrings[activeLocaleStringIndex - 1]
							.id,
					);
			  }
			: undefined;
	const nextLocaleString =
		activeLocaleStringIndex < props.file.localeStrings.length - 1
			? () => {
					setActiveLocaleStringId(
						props.file.localeStrings[activeLocaleStringIndex + 1]
							.id,
					);
			  }
			: undefined;

	const userRole = props.file.project.members.find(
		(m) => m.userId === props.userId,
	)!.role;

	return (
		<div className='h-screen flex flex-col'>
			<div className='grow-0 bg-white/10'>
				<EditorHeader
					projectName={props.file.project.title}
					projectImageUrl={props.file.project.imageUrl}
					fileName={props.file.title}
					projectSlug={props.file.project.slug}
					fileLanguage={props.language}
				/>
			</div>
			<div className='grid grid-cols-4 h-full grow'>
				<div className='col-span-1 bg-black/30 overflow-y-auto p-2 gap-1'>
					<LocaleStringList
						onSelect={setActiveLocaleStringId}
						list={props.file.localeStrings.map((localeString) => ({
							id: localeString.id,
							text: localeString.content,
							isActive: localeString.id === activeLocaleStringId,
							state:
								localeString.translations.length === 0
									? 'not-translated'
									: localeString.translations.some(
											(t) => t.approvedAt,
									  )
									? 'translated'
									: 'in-review',
						}))}
					/>
				</div>
				<div className='col-span-2 py-4 px-6'>
					{activeLocaleString && (
						<EditorCore
							language={props.language}
							key={activeLocaleString.id}
							localeString={activeLocaleString}
							prevLocaleString={prevLocaleString}
							nextLocaleString={nextLocaleString}
							userId={props.userId}
							userRole={userRole}
						/>
					)}
				</div>
				<div className='col-span-1 bg-black/15'>
					Details here including context
				</div>
			</div>
		</div>
	);
}
