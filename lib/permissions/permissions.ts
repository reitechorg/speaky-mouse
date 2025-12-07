import { ProjectMember, ProjectRole } from '../generated/prisma/client';
import { PermissionDefinitions, User } from './types';

export const permissions = {
	user: {
		extends: null,
		project: {
			createSourceFile: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN']),
			view: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers),
			delete: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['OWNER']),
			update: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN']),
			manageMembers: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
		},
		translation: {
			delete: (user, { projectMembers, translation }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']) ||
				(translation.authorId === user.id &&
					translation.approvedAt === null),
			approve: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, [
					'ADMIN',
					'MODERATOR',
					'REVIEWER',
				]),
		},
		localeString: {
			submitSuggestion: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers),
			update: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
			delete: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
		},
		sourceFile: {
			view: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers),
			import: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
			export: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
			update: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
			delete: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
			createLocaleString: (user, { projectMembers }) =>
				hasProjectRole(user, projectMembers, ['ADMIN', 'MODERATOR']),
		},
	},
	admin: {
		extends: 'user',
		project: {
			view: true,
			update: true,
			delete: true,
			manageMembers: true,
			createSourceFile: true,
		},
		sourceFile: {
			view: true,
			import: true,
			export: true,
			update: true,
			delete: true,
			createLocaleString: true,
		},
		localeString: {
			update: true,
			delete: true,
			submitSuggestion: true,
		},
	},
} satisfies PermissionDefinitions;

function hasProjectRole(
	user: User,
	projectMembers: ProjectMember[],
	roles?: ProjectRole[],
): boolean {
	const membership = projectMembers.find((m) => m.userId === user.id);
	if (!membership) return false;

	if (membership.role === 'OWNER') return true;
	if (membership.role === 'BANNED') return false;
	if (!roles || roles.length === 0) return true;

	return roles.includes(membership.role);
}
