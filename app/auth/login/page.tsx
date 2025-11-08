import { Metadata } from 'next';
import Image from 'next/image';
import { LoginButton, LoginButtonList } from './LoginButton';
import { authConfig } from '@/lib/auth-config';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
	title: 'Login - Speaky mouse',
	description: 'Login to your account',
};

function decideLoginLayout(buttonCount: number, emailLoginEnabled: boolean) {
	if (buttonCount < 3 + (emailLoginEnabled ? 0 : 3)) {
		return 'button';
	}
	if (buttonCount < 6) {
		return 'icon';
	}
	return 'compact';
}

export default async function LoginPage() {
	const loginButtons = authConfig.loginButtons;
	const layoutVariant = decideLoginLayout(
		loginButtons.length,
		authConfig.enableEmailLogin,
	);
	return (
		<div className='flex flex-col gap-4'>
			<Image
				src='/icon.webp'
				alt='Speaky Mouse Logo'
				width={64}
				height={64}
				className='mx-auto'
				draggable={false}
			/>
			<h1 className='text-2xl text-center'>Log in</h1>
			{authConfig.enableEmailLogin && <LoginForm />}
			{loginButtons.length > 0 && (
				<>
					{authConfig.enableEmailLogin && (
						<div className='text-sm text-center text-neutral-500'>
							Or continue with
						</div>
					)}
					<LoginButtonList variant={layoutVariant}>
						{loginButtons.map((button) => (
							<LoginButton
								variant={layoutVariant}
								key={button.key}
								provider={button.key}
								title={button.title}
								iconUrl={button.iconUrl}
							/>
						))}
					</LoginButtonList>
				</>
			)}
		</div>
	);
}
