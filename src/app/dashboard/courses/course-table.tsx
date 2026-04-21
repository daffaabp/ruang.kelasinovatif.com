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
import { ArrowUpDown, ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";
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
type AccessFilter = "all" | "free" | "premium";

export function CourseTable({ initialData }: { initialData: PaginatedResult }) {
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [tableData, setTableData] = useState<PaginatedResult>(initialData);
	const [sortField, setSortField] = useState<SortField>("courseName");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
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
			const result = await getCoursesAction({
				page,
				perPage: 5,
				search: debouncedSearch,
				accessFilter,
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
	}, [page, debouncedSearch, sortField, sortOrder, accessFilter]);

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

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, accessFilter]);

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

	return (
		<div className="space-y-4 px-4 sm:px-0">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-2">
					<Search className="h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Cari nama atau deskripsi..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Select
						value={accessFilter}
						onValueChange={(value) => setAccessFilter(value as AccessFilter)}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Filter akses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Semua</SelectItem>
							<SelectItem value="free">🆓 Free</SelectItem>
							<SelectItem value="premium">🔒 Premium</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setSearch("");
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
								<TableHead className="w-[50px]">No</TableHead>
								<TableHead className="min-w-[180px]">
									<Button
										variant="ghost"
										onClick={() => handleSort("courseName")}
										className="flex items-center space-x-2 hover:bg-transparent"
									>
										<span>Nama Jenis Course</span>
										<ArrowUpDown
											className={`h-4 w-4 ${
												sortField === "courseName" ? "text-primary" : ""
											}`}
										/>
									</Button>
								</TableHead>
								<TableHead className="w-[100px]">Akses</TableHead>
								<TableHead className="w-[120px]">Harga</TableHead>
								<TableHead className="w-[100px] text-right">Aksi</TableHead>
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
										<TableCell>
											<Link
												href={`/dashboard/courses/${course.id}`}
												className="group flex items-center gap-1 font-medium hover:text-primary transition-colors"
											>
												<span className="truncate max-w-[200px] lg:max-w-[300px]">
													{course.courseName}
												</span>
												<ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
											</Link>
											{course.courseDescription && (
												<p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">
													{course.courseDescription}
												</p>
											)}
										</TableCell>
										<TableCell>
											{course.accessType === "FREE" ? (
												<Badge
													variant="outline"
													className="border-green-400 text-green-700 bg-green-50"
												>
													Free
												</Badge>
											) : (
												<Badge
													variant="outline"
													className="border-amber-400 text-amber-700 bg-amber-50"
												>
													Premium
												</Badge>
											)}
										</TableCell>
										<TableCell>
											{course.accessType === "PREMIUM" && course.price ? (
												<span className="text-sm">
													Rp{" "}
													{new Intl.NumberFormat("id-ID").format(
														Number(course.price),
													)}
												</span>
											) : course.accessType === "FREE" ? (
												<span className="text-green-600 text-sm font-medium">
													Gratis
												</span>
											) : (
												<span className="text-muted-foreground text-sm">—</span>
											)}
										</TableCell>
										<TableCell className="text-right space-x-1">
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
										Tidak ada jenis course ditemukan.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="space-y-3 rounded-md border bg-white p-4">
				<div className="text-sm text-muted-foreground">
					{tableData.total} jenis course ditemukan.
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
