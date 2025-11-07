export function Modal(props: { children?: React.ReactNode }) {
	return (
		<div className='z-50 fixed top-0 left-0 w-screen h-screen bg-black/25 backdrop-blur-xs flex items-center justify-center'>
			<div className='bg-neutral-900 border border-neutral-800 rounded-lg p-4 max-w-full min-w-96 flex flex-col gap-4'>
				{props.children}
			</div>
		</div>
	);
}
