export function TranslationProgressBar(props: {
	translated: number;
	approved: number;
	total: number;
}) {
	const approvedPercent = (props.approved / (props.total || 1)) * 100;
	const translatedPercent =
		((props.translated - props.approved) / (props.total || 1)) * 100;

	return (
		<div
			className='w-full h-3 bg-black/20 rounded-full flex overflow-hidden'
			title={`${props.approved} approved, ${
				props.translated - props.approved
			} translated, ${
				props.total - props.translated
			} untranslated out of ${props.total} total strings`}>
			<div
				className='h-full bg-green-500'
				style={{ width: `${approvedPercent}%` }}></div>
			<div
				title={``}
				className='h-full bg-primary'
				style={{ width: `${translatedPercent}%` }}></div>
		</div>
	);
}
