import { UsersTable } from './UserTable';

export default async function ManageUsersPage() {
	return (
		<div className='flex flex-col gap-4'>
			<div>
				<h1 className='text-typo-primary font-semibold text-2xl'>
					User management
				</h1>
				<p className='text-typo-secondary'>
					Here you can manage users (not implemented yet)
				</p>
			</div>
			<div>
				<UsersTable />
			</div>
		</div>
	);
}
