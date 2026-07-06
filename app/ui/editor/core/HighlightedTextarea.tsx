'use client';

import {
	forwardRef,
	TextareaHTMLAttributes,
	useImperativeHandle,
	useRef,
} from 'react';
import { splitVariableSegments } from '@/lib/qa/checks/variables';

export type HighlightedTextareaHandle = {
	insertAtCursor: (text: string) => void;
	focus: () => void;
};

type Props = Omit<
	TextareaHTMLAttributes<HTMLTextAreaElement>,
	'value' | 'onChange'
> & {
	value: string;
	onChange: (value: string) => void;
};

export const HighlightedTextarea = forwardRef<
	HighlightedTextareaHandle,
	Props
>(function HighlightedTextarea({ value, onChange, className, ...rest }, ref) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => ({
		insertAtCursor: (text: string) => {
			const el = textareaRef.current;
			const start = el?.selectionStart ?? value.length;
			const end = el?.selectionEnd ?? value.length;
			const next = value.slice(0, start) + text + value.slice(end);
			onChange(next);
			requestAnimationFrame(() => {
				el?.focus();
				const cursor = start + text.length;
				el?.setSelectionRange(cursor, cursor);
			});
		},
		focus: () => textareaRef.current?.focus(),
	}));

	const segments = splitVariableSegments(value);
	const sharedClassName = `whitespace-pre-wrap break-words ${className ?? ''}`;

	return (
		<div className='relative'>
			<div
				ref={overlayRef}
				aria-hidden
				className={`absolute inset-0 overflow-hidden pointer-events-none ${sharedClassName}`}>
				{segments.map((segment, i) =>
					segment.isVariable ? (
						<span
							key={i}
							className='rounded bg-highlight/25 text-transparent'>
							{segment.text}
						</span>
					) : (
						<span key={i} className='text-transparent'>
							{segment.text}
						</span>
					),
				)}
				{value.endsWith('\n') ? '\u200b' : null}
			</div>
			<textarea
				{...rest}
				ref={textareaRef}
				value={value}
				onChange={(ev) => onChange(ev.target.value)}
				onScroll={() => {
					if (overlayRef.current && textareaRef.current) {
						overlayRef.current.scrollTop =
							textareaRef.current.scrollTop;
						overlayRef.current.scrollLeft =
							textareaRef.current.scrollLeft;
					}
				}}
				className={`relative bg-transparent ${sharedClassName}`}
			/>
		</div>
	);
});
