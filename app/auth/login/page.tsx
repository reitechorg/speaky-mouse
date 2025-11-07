import { Metadata } from 'next';
import Image from 'next/image';
import { LoginButton } from './LoginButton';

export const metadata: Metadata = {
	title: 'Login - Speaky mouse',
	description: 'Login to your account',
};

export default async function LoginPage() {
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
			<form className='flex flex-col gap-2'>
				<input
					className='border border-neutral-500 rounded px-4 py-2 w-full'
					type='email'
					placeholder='E-mail'
					name='email'
					autoComplete='email'
				/>
				<input
					className='border border-neutral-500 rounded px-4 py-2 w-full'
					type='password'
					placeholder='Password'
					name='password'
					autoComplete='current-password'
				/>
				<button
					type='submit'
					className='bg-highlight px-4 py-2 rounded cursor-pointer text-white font-bold hover:bg-[#4e9192]'>
					Log in
				</button>
			</form>
			<div className='text-sm text-center text-neutral-500'>
				Or continue with
			</div>
			<LoginButton />
		</div>
	);
}
