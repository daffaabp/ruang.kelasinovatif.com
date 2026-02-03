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
import { getCoursesAction } from "./course-actions";
import { CourseDeleteDialog } from "./course-delete-dialog";
import { CourseEditModal } from "./course-edit-modal";
import type { PaginatedResult } from "./course-types";

const defaultTableData: PaginatedResult = {
	data: [],
	total: 0,
	pageCount: 0,
};

type SortField = "courseName" | "id";
type SortOrder = "asc" | "desc";

export function CourseTable({ initialData }: { initialData: PaginatedResult }) {
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [tableData, setTableData] = useState<PaginatedResult>(initialData);
	const [sortField, setSortField] = useState<SortField>("courseName");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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
			const result = await getCoursesAction({
				page,
				perPage: 5,
				search: debouncedSearch,
				sortField,
				sortOrder,
			});

			if (result && "data" in result && result.data) {
				setTableData(result.data);
			} else {
				setTableData(defaultTableData);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
			setTableData(defaultTableData);
		} finally {
			setLoading(false);
		}
	}, [page, debouncedSearch, sortField, sortOrder]);

	const handleDataChange = useCallback(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (!loading) {
			setTableData((prev) => ({ ...prev }));
		}
	}, [loading]);

	return (
		<div className="space-y-4 px-4 sm:px-0">
			<div className="flex items-center gap-2">
				<Search className="h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search by course name..."
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
								<TableHead className="w-[180px] lg:w-[200px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("courseName")}
										className="flex items-center space-x-2 hover:bg-transparent"
									>
										<span>Course Name</span>
										<ArrowUpDown
											className={`h-4 w-4 ${
												sortField === "courseName" ? "text-primary" : ""
											}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="w-[120px]">Price</TableHead>
								<TableHead className="w-[120px]">Payment Link</TableHead>
								<TableHead className="w-[100px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={5} className="h-24 text-center">
										<div className="flex items-center justify-center">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : tableData.data.length > 0 ? (
								tableData.data.map((course, index) => (
									<TableRow key={course.id}>
										<TableCell>{(page - 1) * 5 + index + 1}</TableCell>
										<TableCell className="font-medium">
											<div className="truncate max-w-[180px] lg:max-w-[200px]">
												{course.courseName}
											</div>
										</TableCell>
										<TableCell>
											{course.price ? (
												<div>
													Rp{" "}
													{new Intl.NumberFormat("id-ID").format(
														Number(course.price),
													)}
												</div>
											) : (
												<div className="text-green-600 font-medium">Gratis</div>
											)}
										</TableCell>
										<TableCell>
											{course.linkPayment ? (
												<a
													href={course.linkPayment}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline"
												>
													View Link
												</a>
											) : (
												<div className="text-muted-foreground">-</div>
											)}
										</TableCell>
										<TableCell className="text-right space-x-2">
											<CourseEditModal
												course={course}
												courses={tableData}
												onDataChange={handleDataChange}
											/>
											<CourseDeleteDialog
												course={course}
												tableData={tableData}
												onDataChange={handleDataChange}
											/>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className="h-24 text-center">
										No courses found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md border">
				<div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left order-2 sm:order-1">
					{tableData.total} course(s) found.
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
