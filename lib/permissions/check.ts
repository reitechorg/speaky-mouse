import {
	PermissionDefinitions,
	Resource,
	ResourceActions,
	ResourceDataType,
	User,
	Role as UserRole,
} from './types';
import { permissions } from './permissions';

export function checkPermission<TResource extends Resource>(
	user: User | null | undefined,
	resource: TResource,
	action: ResourceActions<TResource>,
	data: ResourceDataType<TResource> | null = null,
): boolean {
	if (!user) {
		return false;
	}

	return checkPermissionInternal({
		user,
		role: user.role as UserRole,
		resource,
		action,
		data,
	});
}

function checkPermissionInternal<TResource extends Resource>(ctx: {
	user: User;
	role: UserRole;
	resource: TResource;
	action: ResourceActions<TResource>;
	data: ResourceDataType<TResource> | null;
}): boolean {
	const permission = (permissions as PermissionDefinitions)[ctx.role][
		ctx.resource
	]?.[ctx.action];

	// If permission is undefined, fallback to parent role
	if (permission === undefined) {
		const fallbackRole = (permissions as PermissionDefinitions)[ctx.role]
			.extends;
		if (fallbackRole === null) {
			return false;
		}

		return checkPermissionInternal({
			...ctx,
			role: fallbackRole,
		});
	}

	if (typeof permission === 'boolean') {
		return permission;
	}

	if (ctx.data === null) {
		return false;
	}

	const permissionCheck = permission(ctx.user, ctx.data);
	return permissionCheck;
}
