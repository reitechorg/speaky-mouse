import { db } from '@/lib/db';
import Link from 'next/link';
import { Suspense } from 'react';

function StateIndicator(params: {
	state: 'not-translated' | 'translated' | 'in-review';
}) {
	return (
		<div
			className={`w-3 h-3 rounded-2xl ${
				params.state === 'not-translated'
					? 'bg-red-500'
					: params.state === 'translated'
					? 'bg-green-500'
					: 'bg-yellow-500'
			}`}></div>
	);
}

function LocaleStringListItem(params: {
	id: string;
	text: string;
	state: 'not-translated' | 'translated' | 'in-review';
	isActive: boolean;
}) {
	return (
		<Link
			href={params.id}
			className='flex gap-2 p-2 rounded-md hover:bg-white/10 cursor-pointer items-center'>
			<StateIndicator state={params.state} />
			<div>{params.text}</div>
		</Link>
	);
}

async function LocaleStringList(params: {
	sourceFileId: string;
	targetLang: string;
	activeStringId?: string;
}) {
	const localeStrings = await db.localeString.findMany({
		where: {
			sourceFileId: params.sourceFileId,
		},
		include: {
			translations: {
				where: {
					language: params.targetLang,
				},
			},
		},
	});

	return (
		<div className='w-full h-full'>
			{localeStrings.map((localeString) => (
				<LocaleStringListItem
					key={localeString.id}
					id={localeString.id}
					text={localeString.content}
					state={
						localeString.translations.some((t) => t.approvedAt)
							? 'translated'
							: localeString.translations.length > 0
							? 'in-review'
							: 'not-translated'
					}
					isActive={localeString.id === params.activeStringId}
				/>
			))}
		</div>
	);
}

export default async function EditStringPage({
	params,
}: {
	params: Promise<{
		sourceFileId: string;
		targetLang: string;
		localeStringId: string;
	}>;
}) {
	const { sourceFileId, targetLang, localeStringId } = await params;

	return (
		<div className='h-screen flex flex-col'>
			<div className='grow-0 bg-white/10'>Header here</div>
			<div className='grid grid-cols-4 gap-4 h-full grow'>
				<div className='col-span-1 bg-black/30 overflow-y-auto p-1 gap-1'>
					<LocaleStringList
						sourceFileId={sourceFileId}
						targetLang={targetLang}
						activeStringId={localeStringId}
					/>
				</div>
				<div className='col-span-2'>
					<div>
						Editing string {localeStringId} in {targetLang} for file{' '}
						{sourceFileId}
					</div>
				</div>
				<div className='col-span-1 bg-black/15'>Details here</div>
			</div>
		</div>
	);
}
