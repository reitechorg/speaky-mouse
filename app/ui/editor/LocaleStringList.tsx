'use client';

function StateIndicator(params: {
	state: 'not-translated' | 'translated' | 'in-review';
}) {
	return (
		<div
			className={`w-3 h-3 rounded-2xl ${
				params.state === 'not-translated'
					? 'bg-zinc-500'
					: params.state === 'translated'
					? 'bg-green-500'
					: 'bg-primary'
			}`}></div>
	);
}

type LocaleStringParams = {
	id: string;
	text: string;
	state: 'not-translated' | 'translated' | 'in-review';
	isActive: boolean;

	onSelect?: (id: string) => void;
};

function LocaleStringListItem(params: LocaleStringParams) {
	return (
		<button
			onClick={() => params.onSelect?.(params.id)}
			className={`w-full flex rounded-md cursor-pointer items-center overflow-y-hidden ${
				params.isActive ? 'bg-white/15' : 'hover:bg-white/10'
			}`}>
			<div className='flex items-center gap-2 p-2'>
				<StateIndicator state={params.state} />
				<div>{params.text}</div>
			</div>
			{params.isActive && (
				<div className='ml-auto text-xs bg-highlight h-10 w-1'></div>
			)}
		</button>
	);
}

export function LocaleStringList(params: {
	list: LocaleStringParams[];
	onSelect?: (id: string) => void;
}) {
	return (
		<div className='w-full h-full'>
			{params.list.map((localeString) => (
				<LocaleStringListItem
					key={localeString.id}
					{...localeString}
					onSelect={params.onSelect}
				/>
			))}
		</div>
	);
}
