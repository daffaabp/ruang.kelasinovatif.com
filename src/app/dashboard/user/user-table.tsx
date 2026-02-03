"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { ArrowUpDown, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getUsersAction } from "./user-actions";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserEditModal } from "./user-edit-modal";
import type { PaginatedResult } from "./user-types";

const defaultTableData: PaginatedResult = {
	data: [],
	total: 0,
	pageCount: 0,
};

type SortField = "email" | "name" | "createdAt";
type SortOrder = "asc" | "desc";

export function UserTable({ initialData }: { initialData: PaginatedResult }) {
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [tableData, setTableData] = useState<PaginatedResult>(initialData);
	const [sortField, setSortField] = useState<SortField>("createdAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const debouncedSearch = useDebounce(search, 500);

	const handleSort = (field: SortField) => {
		if (field === sortField) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
	};

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getUsersAction({
				page,
				perPage: 10,
				search: debouncedSearch,
				sortField: sortField === "name" ? "createdAt" : sortField,
				sortOrder,
			});

			if (result && "data" in result && result.data) {
				const sortedData = { ...result.data };

				// Handle name sorting in client-side
				if (sortField === "name") {
					sortedData.data = [...result.data.data].sort((a, b) => {
						const nameA = a.UserProfile
							? `${a.UserProfile.firstName} ${a.UserProfile.lastName}`
							: "";
						const nameB = b.UserProfile
							? `${b.UserProfile.firstName} ${b.UserProfile.lastName}`
							: "";
						return sortOrder === "asc"
							? nameA.localeCompare(nameB)
							: nameB.localeCompare(nameA);
					});
				}

				setTableData(sortedData);
			} else {
				setTableData(defaultTableData);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			setTableData(defaultTableData);
		} finally {
			setLoading(false);
		}
	}, [page, debouncedSearch, sortField, sortOrder]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (!loading) {
			setTableData((prev) => ({ ...prev }));
		}
	}, [loading]);

	const handleDataChange = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className="space-y-4 px-4 sm:px-0">
			<div className="flex items-center gap-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search by name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="max-w-sm"
				/>
			</div>
			<div className="rounded-md border bg-white">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[60px]">No</TableHead>
								<TableHead className="w-[150px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("name")}
										className="flex items-center space-x-2 hover:bg-transparent"
									>
										<span>Name</span>
										<ArrowUpDown
											className={`h-4 w-4 ${
												sortField === "name" ? "text-primary" : ""
											}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="w-[200px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("email")}
										className="flex items-center space-x-2 hover:bg-transparent"
									>
										<span>Email</span>
										<ArrowUpDown
											className={`h-4 w-4 ${
												sortField === "email" ? "text-primary" : ""
											}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="hidden md:table-cell">
									Institution
								</TableHead>
								<TableHead className="w-[120px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("createdAt")}
										className="flex items-center space-x-2 hover:bg-transparent whitespace-nowrap"
									>
										<span>Created At</span>
										<ArrowUpDown
											className={`h-4 w-4 ${
												sortField === "createdAt" ? "text-primary" : ""
											}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="w-[100px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										<div className="flex items-center justify-center">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : tableData.data.length > 0 ? (
								tableData.data.map((user, index) => (
									<TableRow key={user.id}>
										<TableCell>{(page - 1) * 10 + index + 1}</TableCell>
										<TableCell>
											{user.UserProfile
												? `${user.UserProfile.firstName} ${user.UserProfile.lastName}`
												: "-"}
										</TableCell>
										<TableCell className="font-medium">
											<div className="truncate max-w-[200px]">{user.email}</div>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											{user.UserProfile?.institution || "-"}
										</TableCell>
										<TableCell className="whitespace-nowrap">
											{new Date(user.createdAt).toLocaleDateString("id-ID", {
												day: "2-digit",
												month: "2-digit",
												year: "numeric",
											})}
										</TableCell>
										<TableCell className="text-right space-x-2">
											<UserEditModal
												user={user}
												tableData={tableData}
												onDataChange={handleDataChange}
											/>
											<UserDeleteDialog
												user={user}
												tableData={tableData}
												onDataChange={handleDataChange}
											/>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center">
										No users found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md border">
				<div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left order-2 sm:order-1">
					{tableData.total} user(s) found.
				</div>
				<div className="flex items-center justify-center w-full sm:w-auto gap-2 order-1 sm:order-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1 || loading}
					>
						Previous
					</Button>
					<div className="text-sm font-medium min-w-[100px] text-center">
						Page {page} of {tableData.pageCount}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((p) => Math.min(tableData.pageCount, p + 1))}
						disabled={page === tableData.pageCount || loading}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
