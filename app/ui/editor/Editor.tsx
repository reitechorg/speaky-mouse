'use client';

import { ProjectRole } from '@/lib/generated/prisma/enums';
import { EditorHeader } from './EditorHeader';
import { LocaleStringList } from './LocaleStringList';
import { EditorCore } from './core/EditorCore';
import { useSearchParams } from 'next/navigation';
import {
	useEffect,
	useMemo,
	useOptimistic,
	useRef,
	useState,
} from 'react';
import { decodeTreeKey } from '@/lib/utils/key-encode';
import { FilterOptions } from './Filter';
import { runQaChecks } from '@/lib/qa';

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

const sorters = {
	byKey: (a: LocaleString, b: LocaleString) => {
		return a.key.localeCompare(b.key);
	},
	byContent: (a: LocaleString, b: LocaleString) => {
		return a.content.localeCompare(b.content);
	},
	translateThread: (a: LocaleString, b: LocaleString) => {
		const isTranslated = a.translations.length > 0;
		const isTranslatedB = b.translations.length > 0;

		if (isTranslated && !isTranslatedB) {
			return 1;
		}
		if (!isTranslated && isTranslatedB) {
			return -1;
		}

		const approvedA = a.translations.some((t) => t.approvedAt);
		const approvedB = b.translations.some((t) => t.approvedAt);

		if (approvedA && !approvedB) {
			return 1;
		}
		if (!approvedA && approvedB) {
			return -1;
		}

		return 0;
	},
	approveThread: (a: LocaleString, b: LocaleString) => {
		const approvedA = a.translations.some((t) => t.approvedAt);
		const approvedB = b.translations.some((t) => t.approvedAt);

		if (!approvedA && approvedB) {
			return -1;
		}
		if (approvedA && !approvedB) {
			return 1;
		}

		const isTranslatedA = a.translations.length > 0;
		const isTranslatedB = b.translations.length > 0;

		if (isTranslatedA && !isTranslatedB) {
			return -1;
		}
		if (!isTranslatedA && isTranslatedB) {
			return 1;
		}

		return 0;
	},
};

function getSortedIds<T extends { id: string }>(
	list: T[],
	sorter: (a: T, b: T) => number,
) {
	const sorted = list.sort(sorter);
	return sorted.map(({ id }) => id);
}

const selectedStringProperty = 'id';
const defaultStringSorter: keyof typeof sorters = 'byContent';
export function Editor(props: {
	file: SourceFile;
	language: string;
	userId: string;
}) {
	const params = useSearchParams();
	const activeLocaleStringId =
		params.get(selectedStringProperty) || props.file.localeStrings[0]?.id;
	const setActiveLocaleStringId = (id: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set(selectedStringProperty, id);
		window.history.replaceState({}, '', url.toString());
	};

	const sortBy = params.get('sort') || defaultStringSorter;
	const sorterName = (
		Object.keys(sorters).includes(sortBy) ? sortBy : defaultStringSorter
	) as keyof typeof sorters;

	const [optimisticLocaleStrings, addOptimisticTranslation] = useOptimistic(
		props.file.localeStrings,
		(
			state: LocaleString[],
			update: { localeStringId: string; translation: Translation },
		) =>
			state.map((ls) =>
				ls.id === update.localeStringId
					? {
							...ls,
							translations: [update.translation, ...ls.translations],
						}
					: ls,
			),
	);

	const localeStringsById = useMemo(() => {
		const map = new Map<string, LocaleString>();
		for (const localeString of optimisticLocaleStrings) {
			map.set(localeString.id, localeString);
		}
		return map;
	}, [optimisticLocaleStrings]);

	const idsKey = props.file.localeStrings.map((ls) => ls.id).join(',');

	const [orderedIds, setOrderedIds] = useState<string[]>(() =>
		getSortedIds([...props.file.localeStrings], sorters[sorterName]),
	);
	const prevSorterRef = useRef(sorterName);

	useEffect(() => {
		const sorterChanged = prevSorterRef.current !== sorterName;
		prevSorterRef.current = sorterName;

		if (sorterChanged) {
			setOrderedIds(
				getSortedIds([...props.file.localeStrings], sorters[sorterName]),
			);
			return;
		}

		setOrderedIds((prevOrder) => {
			const currentIds = new Set(
				props.file.localeStrings.map((ls) => ls.id),
			);
			const kept = prevOrder.filter((id) => currentIds.has(id));
			const keptSet = new Set(kept);
			const added = getSortedIds(
				props.file.localeStrings.filter(
					(ls) => !keptSet.has(ls.id),
				),
				sorters[sorterName],
			);

			if (added.length === 0 && kept.length === prevOrder.length) {
				return prevOrder;
			}

			return [...kept, ...added];
		});
		// Only recompute ordering when the sort option changes or locale
		// strings are added/removed — not when translation content/state
		// changes, so edits don't shift a string's position in the list.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sorterName, idsKey]);

	const orderedLocaleStrings = orderedIds
		.map((id) => localeStringsById.get(id))
		.filter((ls): ls is LocaleString => !!ls);

	const activeLocaleStringIndex = orderedLocaleStrings.findIndex(
		(ls) => ls.id === activeLocaleStringId,
	);
	const activeLocaleString =
		orderedLocaleStrings[activeLocaleStringIndex] || null;

	const prevLocaleString = useMemo(() => {
		return activeLocaleStringIndex > 0
			? () => {
					setActiveLocaleStringId(
						orderedLocaleStrings[activeLocaleStringIndex - 1].id,
					);
				}
			: undefined;
	}, [activeLocaleStringIndex, orderedLocaleStrings]);
	const nextLocaleString = useMemo(() => {
		return activeLocaleStringIndex < orderedLocaleStrings.length - 1
			? () => {
					setActiveLocaleStringId(
						orderedLocaleStrings[activeLocaleStringIndex + 1].id,
					);
				}
			: undefined;
	}, [activeLocaleStringIndex, orderedLocaleStrings]);

	const userRole = props.file.project.members.find(
		(m) => m.userId === props.userId,
	)!.role;

	useEffect(() => {
		const keydownHandler = (e: KeyboardEvent) => {
			if (e.key === 'PageDown') {
				if (nextLocaleString) {
					nextLocaleString();
				}
			} else if (e.key === 'PageUp') {
				if (prevLocaleString) {
					prevLocaleString();
				}
			}
		};

		document.addEventListener('keydown', keydownHandler);

		return () => {
			document.removeEventListener('keydown', keydownHandler);
		};
	}, [nextLocaleString, prevLocaleString]);

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
			<div className='grid grid-cols-4 h-full grow overflow-hidden'>
				<div className='col-span-1 bg-black/30 overflow-y-auto p-2 gap-1'>
					<FilterOptions
						targetLanguages={props.file.targetLanguages.map(
							(tl) => tl.language,
						)}
					/>
					<LocaleStringList
						onSelect={setActiveLocaleStringId}
						list={orderedLocaleStrings
							.map((localeString) => {
								const relevantTranslation =
									localeString.translations.find(
										(t) => t.approvedAt,
									) ?? localeString.translations[0];
								const hasQaIssues = relevantTranslation
									? runQaChecks(
											localeString.content,
											relevantTranslation.content,
											{ maxLength: localeString.maxLength },
										).length > 0
									: false;
								return {
									id: localeString.id,
									text: localeString.content,
									isActive:
										localeString.id === activeLocaleStringId,
									state:
										localeString.translations.length === 0
											? ('not-translated' as const)
											: localeString.translations.some(
														(t) => t.approvedAt,
												  )
												? ('translated' as const)
												: ('in-review' as const),
									hasQaIssues,
								};
							})}
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
							onAddOptimisticTranslation={addOptimisticTranslation}
						/>
					)}
				</div>
				<div className='col-span-1 bg-black/15'>
					<div className='p-4 flex flex-col gap-2'>
						<div className='flex gap-1 items-baseline'>
							<div className='text-typo-primary rounded'>
								Key:
							</div>
							<div className='text-typo-secondary'>
								{decodeTreeKey(activeLocaleString.key).map(
									(part, i) => (
										<span key={part}>
											{i > 0 && '.'}
											{'"'}
											{part}
											{'"'}
										</span>
									),
								)}
							</div>
						</div>
						<div>
							<div className='text-typo-primary'>
								Description:
							</div>
							<div className='text-typo-secondary'>
								{activeLocaleString.content}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
