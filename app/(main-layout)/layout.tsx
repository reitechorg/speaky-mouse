import { Header } from '../ui/Header';

export default async function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div>
			<Header />
			<div className='container mx-auto py-8'>{children}</div>
		</div>
	);
}
