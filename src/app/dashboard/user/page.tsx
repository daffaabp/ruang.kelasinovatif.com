import { Suspense } from "react";
import { getUsersAction } from "./user-actions";
import { UserAddModal } from "./user-add-modal";
import { UserExportButton } from "./user-export-button";
import { UserTable } from "./user-table";
import type { PaginatedResult } from "./user-types";

export default async function UsersPage() {
	// 1. Data Fetching
	const result = await getUsersAction({
		page: 1,
		perPage: 10,
	});

	if (!result || !("data" in result) || !result.data) {
		throw new Error("Failed to fetch users");
	}

	const paginatedResult = result.data as PaginatedResult;

	// 2. Component Layout
	return (
		<div className="space-y-4">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
						Users
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage users and their profiles
					</p>
				</div>
				<div className="flex gap-2">
					<UserExportButton totalUsers={paginatedResult.total} />
					<UserAddModal users={paginatedResult} />
				</div>
			</div>

			{/* Table Section with Loading State */}
			<div>
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-32">
							<div className="text-muted-foreground">Loading...</div>
						</div>
					}
				>
					<UserTable initialData={paginatedResult} />
				</Suspense>
			</div>
		</div>
	);
}
