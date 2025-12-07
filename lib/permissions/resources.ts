import {
	LocaleString,
	Project,
	ProjectMember,
	SourceFile,
	Translation,
} from '../generated/prisma/client';
import { ResourceDefinitions, Satisfies } from './types';

type PermissionResources = {
	translation: {
		dataType: {
			translation: Translation;
			projectMembers: ProjectMember[];
		};
		actions: 'approve' | 'delete';
	};
	sourceFile: {
		dataType: {
			sourceFile: SourceFile;
			projectMembers: ProjectMember[];
		};
		actions:
			| 'view'
			| 'import'
			| 'export'
			| 'update'
			| 'delete'
			| 'createLocaleString';
	};
	localeString: {
		dataType: {
			localeString: LocaleString;
			projectMembers: ProjectMember[];
		};
		actions: 'update' | 'delete' | 'submitSuggestion';
	};
	project: {
		dataType: {
			project: Project;
			projectMembers: ProjectMember[];
		};
		actions:
			| 'view'
			| 'update'
			| 'delete'
			| 'manageMembers'
			| 'createSourceFile';
	};
};

export type Resources = Satisfies<PermissionResources, ResourceDefinitions>;
