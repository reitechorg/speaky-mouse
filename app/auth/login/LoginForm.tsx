'use client';

import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const params = useSearchParams();
	const callbackUrl = params.get('back');

	return (
		<form
			className='flex flex-col gap-2'
			onSubmit={(e) => {
				e.preventDefault();
				authClient.signIn.email({
					email,
					password,
					callbackURL: callbackUrl || window.location.href,
				});
			}}>
			<input
				className='border border-neutral-500 rounded px-4 py-2 w-full'
				type='email'
				placeholder='E-mail'
				name='email'
				autoComplete='email'
				value={email}
				onChange={(event) => {
					setEmail(event.target.value);
				}}
			/>
			<input
				className='border border-neutral-500 rounded px-4 py-2 w-full'
				type='password'
				placeholder='Password'
				name='password'
				autoComplete='current-password'
				value={password}
				onChange={(event) => {
					setPassword(event.target.value);
				}}
			/>
			<button
				type='submit'
				className='bg-highlight px-4 py-2 rounded cursor-pointer text-white font-bold hover:bg-[#4e9192]'>
				Log in
			</button>
		</form>
	);
}
