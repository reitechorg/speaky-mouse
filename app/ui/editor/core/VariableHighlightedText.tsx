import { splitVariableSegments } from '@/lib/qa/checks/variables';

export function VariableHighlightedText(props: {
	text: string;
	onVariableClick?: (value: string) => void;
	title?: string;
}) {
	const segments = splitVariableSegments(props.text);

	return (
		<div className='whitespace-pre-wrap break-words'>
			{segments.map((segment, i) =>
				segment.isVariable ? (
					<button
						key={i}
						type='button'
						title={props.title}
						disabled={!props.onVariableClick}
						onClick={() => props.onVariableClick?.(segment.text)}
						className={`rounded bg-highlight/20 text-highlight font-mono text-[0.9em] px-0.5 ${
							props.onVariableClick
								? 'cursor-pointer hover:bg-highlight/35'
								: 'cursor-text'
						}`}>
						{segment.text}
					</button>
				) : (
					<span key={i}>{segment.text}</span>
				),
			)}
		</div>
	);
}
