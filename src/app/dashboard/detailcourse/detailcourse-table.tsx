"use client";

import { Badge } from "@/components/ui/badge";
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
import { CourseType } from "@prisma/client";
import { ArrowUpDown, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDetailCoursesAction } from "./detailcourse-actions";
import { DetailCourseDeleteDialog } from "./detailcourse-delete-dialog";
import { DetailCourseEditModal } from "./detailcourse-edit-modal";
import type { PaginatedResult } from "./detailcourse-types";

const defaultTableData: PaginatedResult = {
	data: [],
	total: 0,
	pageCount: 0,
};

type SortField = "title" | "updatedAt";
type SortOrder = "asc" | "desc";

interface CourseOption {
	id: string;
	courseName: string;
}

interface DetailCourseTableProps {
	initialData: PaginatedResult;
	courseOptions: CourseOption[];
	selectedCourseId?: string;
}

function formatDate(date: Date) {
	return new Date(date).toLocaleDateString("id-ID", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function DetailCourseTable({
	initialData,
	courseOptions,
	selectedCourseId,
}: DetailCourseTableProps) {
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [tableData, setTableData] = useState<PaginatedResult>(initialData);
	const [sortField, setSortField] = useState<SortField>("updatedAt");
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
			const result = await getDetailCoursesAction({
				page,
				perPage: 5,
				search: debouncedSearch,
				sortField,
				sortOrder,
				courseId: selectedCourseId,
			});

			if (result && "data" in result && result.data) {
				setTableData(result.data);
			} else {
				setTableData(defaultTableData);
			}
		} catch (error) {
			console.error("Error fetching course details:", error);
			setTableData(defaultTableData);
		} finally {
			setLoading(false);
		}
	}, [page, debouncedSearch, sortField, sortOrder, selectedCourseId]);

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
					placeholder="Cari berdasarkan judul..."
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
										onClick={() => handleSort("title")}
										className="flex items-center space-x-2 hover:bg-transparent"
									>
										<span>Title</span>
										<ArrowUpDown
											className={`h-4 w-4 ${sortField === "title" ? "text-primary" : ""}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="hidden md:table-cell min-w-[200px] lg:min-w-[300px] max-w-[400px] xl:max-w-[500px]">
									Description
								</TableHead>
								<TableHead className="w-[120px]">Course</TableHead>
								<TableHead className="w-[100px]">Type</TableHead>
								<TableHead className="w-[120px] lg:w-[150px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("updatedAt")}
										className="flex items-center space-x-2 hover:bg-transparent whitespace-nowrap"
									>
										<span>Last Updated</span>
										<ArrowUpDown
											className={`h-4 w-4 ${sortField === "updatedAt" ? "text-primary" : ""}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="w-[100px] text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										<div className="flex items-center justify-center">
											<Loader2 className="h-6 w-6 animate-spin" />
										</div>
									</TableCell>
								</TableRow>
							) : tableData.data.length > 0 ? (
								tableData.data.map((detail, index) => (
									<TableRow key={detail.id}>
										<TableCell>{(page - 1) * 5 + index + 1}</TableCell>
										<TableCell className="font-medium">
											<div className="truncate max-w-[180px] lg:max-w-[200px]">
												{detail.title}
											</div>
										</TableCell>
										<TableCell className="hidden md:table-cell">
											<div
												className="max-w-[300px] truncate"
												title={detail.description}
											>
												{detail.description}
											</div>
										</TableCell>
										<TableCell>
											<div className="truncate max-w-[120px]">
												{detail.course.courseName}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													detail.courseType === CourseType.EBOOK
														? "default"
														: "secondary"
												}
											>
												{detail.courseType === CourseType.EBOOK
													? "E-Book"
													: "Video"}
											</Badge>
										</TableCell>
										<TableCell className="whitespace-nowrap">
											{formatDate(detail.updatedAt)}
										</TableCell>
										<TableCell className="text-right space-x-2">
											<DetailCourseEditModal
												detail={{
													...detail,
													videoUrl: detail.videoUrl ?? null,
													downloadUrl: detail.downloadUrl ?? null,
												}}
												tableData={tableData}
												onDataChange={handleDataChange}
												courseOptions={courseOptions}
											/>
											<DetailCourseDeleteDialog
												detail={{
													...detail,
													videoUrl: detail.videoUrl ?? null,
													downloadUrl: detail.downloadUrl ?? null,
												}}
												tableData={tableData}
												onDataChange={handleDataChange}
											/>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className="h-24 text-center">
										No course details found.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md border">
				<div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left order-2 sm:order-1">
					{tableData.total} detail course ditemukan.
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
