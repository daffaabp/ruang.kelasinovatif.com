"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
type CourseTypeFilter = "all" | "EBOOK" | "VIDEO";
type AccessFilter = "all" | "free" | "premium";

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
	const [courseTypeFilter, setCourseTypeFilter] =
		useState<CourseTypeFilter>("all");
	const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");

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
				courseTypeFilter:
					courseTypeFilter === "all" ? undefined : courseTypeFilter,
				accessFilter: accessFilter === "all" ? undefined : accessFilter,
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
	}, [
		page,
		debouncedSearch,
		sortField,
		sortOrder,
		selectedCourseId,
		courseTypeFilter,
		accessFilter,
	]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (!loading) {
			setTableData((prev) => ({ ...prev }));
		}
	}, [loading]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, selectedCourseId, courseTypeFilter, accessFilter]);

	const totalPages = Math.max(1, tableData.pageCount);
	const getPageNumbers = () => {
		const pages: Array<number | "ellipsis"> = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
			return pages;
		}
		pages.push(1);
		if (page > 3) pages.push("ellipsis");
		for (
			let i = Math.max(2, page - 1);
			i <= Math.min(totalPages - 1, page + 1);
			i++
		) {
			pages.push(i);
		}
		if (page < totalPages - 2) pages.push("ellipsis");
		pages.push(totalPages);
		return pages;
	};

	const handleDataChange = useCallback(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className="space-y-4 px-4 sm:px-0">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<Search className="h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Cari judul/deskripsi/course..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Select
						value={courseTypeFilter}
						onValueChange={(value) =>
							setCourseTypeFilter(value as CourseTypeFilter)
						}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Tipe konten" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua tipe</SelectItem>
							<SelectItem value="EBOOK">E-Book</SelectItem>
							<SelectItem value="VIDEO">Video</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={accessFilter}
						onValueChange={(value) => setAccessFilter(value as AccessFilter)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Filter akses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua akses</SelectItem>
							<SelectItem value="free">🆓 Free</SelectItem>
							<SelectItem value="premium">🔒 Premium</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setSearch("");
							setCourseTypeFilter("all");
							setAccessFilter("all");
							setPage(1);
						}}
					>
						Reset
					</Button>
				</div>
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
								<TableHead className="w-[120px]">Jenis Course</TableHead>
								<TableHead className="w-[90px]">Akses</TableHead>
								<TableHead className="w-[100px]">Tipe</TableHead>
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
									<TableCell colSpan={8} className="h-24 text-center">
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
											{detail.course.accessType === "FREE" ? (
												<Badge
													variant="outline"
													className="border-green-400 text-green-700 bg-green-50 text-xs"
												>
													Free
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="border-amber-400 text-amber-700 bg-amber-50 text-xs"
												>
													Premium
												</Badge>
											)}
										</TableCell>
										<TableCell>
											<Badge
												variant={
													detail.courseType === "EBOOK"
														? "default"
														: "secondary"
												}
											>
												{detail.courseType === "EBOOK"
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
							<TableCell colSpan={8} className="h-24 text-center">
									Tidak ada rekaman ditemukan.
								</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="space-y-3 rounded-md border bg-white p-4">
				<div className="text-sm text-muted-foreground">
					{tableData.total} detail course ditemukan.
				</div>
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1 || loading}
							/>
						</PaginationItem>
						{getPageNumbers().map((pageItem, index) => (
							<PaginationItem key={`${pageItem}-${index}`}>
								{pageItem === "ellipsis" ? (
									<PaginationEllipsis />
								) : (
									<PaginationLink
										isActive={pageItem === page}
										onClick={() => setPage(pageItem)}
										disabled={loading}
									>
										{pageItem}
									</PaginationLink>
								)}
							</PaginationItem>
						))}
						<PaginationItem>
							<PaginationNext
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages || loading}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
