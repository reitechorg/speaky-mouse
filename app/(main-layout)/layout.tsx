import { Header } from '../ui/Header';

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div>
			<Header />
			<div className='p-4'>{children}</div>
		</div>
	);
}
