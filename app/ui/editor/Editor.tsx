'use client';

import { useEffect, useState } from 'react';
import { EditorHeader } from './EditorHeader';
import { LocaleStringList } from './LocaleStringList';

type Translation = {
	id: string;
	language: string;
	content: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	approvedBy: string | null;
	approvedAt: Date | null;
};

type LocaleString = {
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

	return (
		<div className='h-screen flex flex-col'>
			<div className='grow-0 bg-white/10'>
				<EditorHeader />
			</div>
			<div className='grid grid-cols-4 gap-4 h-full grow'>
				<div className='col-span-1 bg-black/30 overflow-y-auto p-1 gap-1'>
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
				<div className='col-span-2'>
					{/* <div>
						Editing string {localeStringId} in {targetLang} for file{' '}
						{sourceFileId}
					</div> */}
				</div>
				<div className='col-span-1 bg-black/15'>Details here</div>
			</div>
		</div>
	);
}
