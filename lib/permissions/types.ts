import { User as BetterAuthUser } from 'better-auth';
import { Resources } from './resources';

export type Role = 'admin' | 'user';
export type User = BetterAuthUser & {
	role?: string | null | undefined;
};

export type Satisfies<T extends U, U> = T;
export type ResourceDefinitions = Record<
	string,
	{
		dataType: unknown;
		actions: string;
	}
>;

type PermissionCheck<TResource extends keyof Resources> =
	| boolean
	| ((user: User, data: Resources[TResource]['dataType']) => boolean);

type RolePermissions = {
	[TResource in keyof Resources]: Partial<{
		[TAction in Resources[TResource]['actions']]: PermissionCheck<TResource>;
	}>;
};

export type PermissionDefinitions = {
	[TRole in Role]: Partial<RolePermissions> & {
		extends: Role | null;
	};
};

export type Resource = keyof Resources;
export type ResourceActions<TResource extends Resource> =
	Resources[TResource]['actions'];
export type ResourceDataType<TResource extends Resource> =
	Resources[TResource]['dataType'];
