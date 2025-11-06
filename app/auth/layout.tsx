import Image from 'next/image';

export default function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='h-screen'>
			<div className='flex gap-4 items-center p-4'>
				<Image
					src='/icon.webp'
					alt='Speaky Mouse Logo'
					width={64}
					height={64}
					className='w-15 h-15 object-scale-down'
				/>
				<div>
					<div className='text-[#c8e6f1] font-semibold text-xl'>
						Speaky Mouse
					</div>
					<div className='text-accent text-sm'>
						Let every language squeak!
					</div>
				</div>
			</div>
			<div className='flex justify-center items-center'>
				<div className='p-4 bg-amber-50 text-background max-w-full w-100 rounded-xl'>
					{children}
				</div>
			</div>
		</div>
	);
}
