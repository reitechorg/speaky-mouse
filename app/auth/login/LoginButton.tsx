'use client';

import { signIn } from '@/lib/auth-client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

type ButtonTheme = {
	wrapper: string;
	text: string;
	image: string;
	list: string;
};

const styles: Record<string, ButtonTheme> = {
	compact: {
		wrapper:
			'border-b border-neutral-400 last-of-type:border-b-0 px-4 py-2 w-full flex items-center justify-start gap-4 hover:bg-neutral-200 cursor-pointer',
		text: '',
		image: 'w-6 h-6 object-contain',
		list: 'flex flex-col border border-neutral-400 rounded-2xl overflow-hidden',
	},
	button: {
		wrapper:
			'border border-neutral-400 px-2 py-2 w-full flex items-center justify-start gap-4 hover:bg-neutral-200 cursor-pointer rounded-2xl',
		text: 'text-lg',
		image: 'w-6 h-6 object-contain',
		list: 'flex flex-col gap-2',
	},
	icon: {
		wrapper:
			'flex flex-col items-center gap-2 hover:bg-neutral-200 cursor-pointer p-2 rounded-md',
		text: 'text-nowrap',
		image: 'w-10 h-10 object-contain',
		list: 'flex flex-row justify-around gap-0',
	},
};

export function LoginButtonList(props: {
	variant: 'button' | 'compact' | 'icon';
	children: React.ReactNode;
}) {
	return <div className={styles[props.variant].list}>{props.children}</div>;
}

export function LoginButton(props: {
	variant: 'button' | 'compact' | 'icon';
	provider: string;
	title: string;
	iconUrl?: string;
	type: 'social' | 'oauth';
	autoLogin?: boolean;
}) {
	const params = useSearchParams();
	const callbackUrl = params.get('back');

	const clickHandler = useCallback(() => {
		if (props.type === 'oauth') {
			signIn.oauth2({
				providerId: props.provider,
				callbackURL: callbackUrl || window.location.href,
			});
			return;
		}

		signIn.social({
			provider: props.provider,
			callbackURL: callbackUrl || window.location.href,
		});
	}, [props.provider, props.type, callbackUrl]);

	useEffect(() => {
		if (props.autoLogin) {
			clickHandler();
		}
	}, [props.autoLogin, clickHandler]);

	return (
		<button
			onClick={clickHandler}
			className={styles[props.variant].wrapper}>
			<Image
				src={props.iconUrl || '/login-providers/generic-link.png'}
				alt={`${props.title} icon`}
				width={20}
				height={20}
				className={styles[props.variant].image}
				unoptimized
			/>
			<div className={styles[props.variant].text}>{props.title}</div>
		</button>
	);
}
