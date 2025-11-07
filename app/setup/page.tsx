import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function canRunSetup() {
	const userCount = await db.user.count();
	return userCount === 0;
}

export async function registerAdminUser(formData: FormData) {
	'use server';

	const setupAllowed = await canRunSetup();

	if (!setupAllowed) {
		throw new Error('Setup is not allowed.');
	}

	const email = formData.get('email');
	const password = formData.get('password');
	const name = formData.get('name');

	if (
		!email ||
		!password ||
		!name ||
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof name !== 'string'
	) {
		throw new Error('Invalid form data.');
	}

	await auth.api.createUser({
		body: {
			email: email.trim(),
			password: password.trim(),
			name: name.trim(),
			role: 'admin',
		},
	});

	await auth.api.signInEmail({
		body: {
			email: email.trim(),
			password: password.trim(),
		},
		headers: await headers(),
	});

	redirect('/admin');
}

export default async function SetupPage() {
	const setupAllowed = await canRunSetup();

	if (!setupAllowed) {
		redirect('/');
	}

	return (
		<div className='flex flex-col gap-4 bg-amber-50 text-background w-200 p-8 rounded-lg mx-auto mt-20'>
			<h1 className='text-2xl'>Setup Speaky Mouse</h1>
			<p>
				Welcome to Speaky Mouse! Since this is the first time you are
				running the application, please create an admin account to get
				started.
			</p>
			<form className='flex flex-col gap-2' action={registerAdminUser}>
				<input
					className='border border-neutral-500 rounded px-4 py-2 w-full'
					type='text'
					placeholder='Account Name'
					name='name'
					autoComplete='off'
				/>
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
					autoComplete='new-password'
				/>
				<button
					type='submit'
					className='bg-highlight px-4 py-2 rounded cursor-pointer text-white font-bold hover:bg-[#4e9192]'>
					Create Admin Account
				</button>
			</form>
		</div>
	);
}
