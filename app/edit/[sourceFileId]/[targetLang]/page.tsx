import { Editor } from '@/app/ui/editor/Editor';
import { db } from '@/lib/db';

export default async function EditStringPage({
	params,
}: {
	params: Promise<{
		sourceFileId: string;
		targetLang: string;
		localeStringId: string;
	}>;
}) {
	const { sourceFileId, targetLang, localeStringId } = await params;

	const data = await db.sourceFile.findUnique({
		where: {
			id: sourceFileId,
			targetLanguages: {
				some: {
					language: targetLang,
				},
			},
		},
		include: {
			targetLanguages: true,
			project: true,
			localeStrings: {
				include: {
					translations: {
						where: {
							language: targetLang,
						},
					},
				},
			},
		},
	});

	if (!data) {
		return (
			<div>Source file not found or target language not supported.</div>
		);
	}

	return <Editor file={data} />;
}
