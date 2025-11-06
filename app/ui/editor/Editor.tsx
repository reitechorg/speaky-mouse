'use client';

import { useState } from 'react';
import { EditorHeader } from './EditorHeader';
import { LocaleStringList } from './LocaleStringList';
import { EditorCore } from './core/EditorCore';

export type Translation = {
	id: string;
	language: string;
	content: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	approvedBy: string | null;
	approvedAt: Date | null;
};

export type LocaleString = {
	id: string;
	content: string;
	key: string;
	maxLength: number | null;
	translations: Translation[];
};

type SourceFile = {
	id: string;
	title: string;
	targetLanguages: {
		language: string;
	}[];
	localeStrings: LocaleString[];
};

export function Editor(props: { file: SourceFile }) {
	const [activeLocaleStringId, setActiveLocaleStringId] = useState<
		string | null
	>(props.file.localeStrings[0]?.id || null);

	const activeLocaleString = props.file.localeStrings.find(
		(ls) => ls.id === activeLocaleStringId,
	);

	return (
		<div className='h-screen flex flex-col'>
			<div className='grow-0 bg-white/10'>
				<EditorHeader />
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
						<EditorCore key={activeLocaleString.id} />
					)}
				</div>
				<div className='col-span-1 bg-black/15'>
					Details here including context
				</div>
			</div>
		</div>
	);
}
