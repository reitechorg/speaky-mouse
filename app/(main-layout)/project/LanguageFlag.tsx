import Image from 'next/image';

export function LanguageFlag(props: { languageCode: string }) {
	const code = props.languageCode.toLowerCase();

	return (
		<Image
			src={`/flags/lang/${code}.svg`}
			alt={`Flag of ${props.languageCode}`}
			className='w-full h-full object-contain'
			width={24}
			height={24}
		/>
	);
}
