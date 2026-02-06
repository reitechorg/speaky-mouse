'use client';

import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';

function langFlag(lang: string) {
	return `/flags/lang/${lang}.svg`;
}

export function FilterOptions(props: { targetLanguages: string[] }) {
	// const params = useParams();
	// const currentLang = `${params.targetLang}`;

	const qParams = useSearchParams();
	const sort = qParams.get('sort') || 'byContent';
	const setSort = (sort: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set('sort', sort);
		window.history.replaceState({}, '', url.toString());
	};
	return (
		<div className='flex items-center gap-4 py-2'>
			<div className='flex items-center justify-center w-full'>
				<select value={sort} onChange={(e) => setSort(e.target.value)}>
					<option className='text-black' value='byContent'>
						Sort by content
					</option>
					<option className='text-black' value='byKey'>
						Sort by key
					</option>
					<option className='text-black' value='translateThread'>
						Untranslated first
					</option>
					<option className='text-black' value='approveThread'>
						Not approved first
					</option>
				</select>
			</div>
		</div>
	);
}
