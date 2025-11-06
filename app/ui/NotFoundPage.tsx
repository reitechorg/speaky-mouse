function NotFound(props: { text: string }) {
	return (
		<div className='flex flex-col items-center justify-center h-full'>
			<h1 className='text-4xl font-bold mb-4'>404 - Not Found</h1>
			<p className='text-lg text-center'>{props.text}</p>
		</div>
	);
}

export function NotFoundProject() {
	return (
		<NotFound text='The requested project does not exist or you do not have access to it.' />
	);
}
