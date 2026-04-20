"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CourseType } from "@prisma/client";
import { BookOpen, BookX, LayoutGrid, PlayCircle, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { getFreeCoursesAction } from "./course-actions";
import { CourseCard } from "./course-card";
import type { PaginatedResult } from "./course-types";

interface CourseGridProps {
	initialData: PaginatedResult;
}

const filters: { value: CourseType | "ALL"; label: string; icon: ReactNode }[] =
	[
		{ value: "ALL", label: "Semua", icon: <LayoutGrid className="h-4 w-4" /> },
		{ value: CourseType.VIDEO, label: "Video", icon: <PlayCircle className="h-4 w-4" /> },
		{ value: CourseType.EBOOK, label: "E-Book", icon: <BookOpen className="h-4 w-4" /> },
	];

export function CourseGrid({ initialData }: CourseGridProps) {
	const [loading, setLoading] = useState(false);
	const [courseType, setCourseType] = useState<CourseType | "ALL">("ALL");
	const [data, setData] = useState<PaginatedResult>(initialData);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getFreeCoursesAction({
				courseType: courseType === "ALL" ? undefined : courseType,
			});
			if (result && "data" in result && result.data) {
				setData(result.data);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
		} finally {
			setLoading(false);
		}
	}, [courseType]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const filtered = searchQuery
		? data.data.filter(
				(c) =>
					c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					c.description.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: data.data;

	return (
		<div className="space-y-5">
			{/* Search + Filter */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						type="text"
						placeholder="Cari materi berdasarkan nama..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 h-10 text-sm rounded-xl border-border/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
					/>
				</div>

				{/* Pill filter */}
				<div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 w-fit shrink-0">
					{filters.map((f) => {
						const isActive = courseType === f.value;
						return (
							<button
								key={f.value}
								onClick={() => setCourseType(f.value)}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
									isActive
										? "bg-white shadow-sm text-emerald-700 border border-emerald-100"
										: "text-muted-foreground hover:text-foreground hover:bg-white/50",
								)}
							>
								<span className={cn(isActive ? "text-emerald-600" : "text-muted-foreground")}>
									{f.icon}
								</span>
								{f.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Count */}
			{!loading && filtered.length > 0 && (
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold text-foreground">{filtered.length}</span>{" "}
					materi tersedia
					{searchQuery && (
						<> untuk &ldquo;{searchQuery}&rdquo;</>
					)}
				</p>
			)}

			{/* Grid */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 9 }).map((_, i) => (
						<div key={i} className="rounded-xl border border-border/60 overflow-hidden">
							<Skeleton className="h-1 w-full rounded-none" />
							<div className="p-4 space-y-3">
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-full rounded" />
								<Skeleton className="h-4 w-3/4 rounded" />
								<Skeleton className="h-3 w-full rounded mt-1" />
								<Skeleton className="h-3 w-5/6 rounded" />
							</div>
						</div>
					))}
				</div>
			) : filtered.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filtered.map((course) => (
						<CourseCard
							key={course.id}
							id={course.id}
							title={course.title}
							description={course.description}
							courseType={course.courseType}
							courseName={course.course.courseName}
							videoUrl={course.videoUrl}
							downloadUrl={course.downloadUrl}
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border bg-muted/20">
					{searchQuery ? (
						<>
							<Search className="h-10 w-10 text-muted-foreground mb-3" />
							<p className="text-base font-semibold text-foreground">Materi tidak ditemukan</p>
							<p className="text-sm text-muted-foreground mt-1">Coba gunakan kata kunci lain</p>
						</>
					) : (
						<>
							<BookX className="h-10 w-10 text-muted-foreground mb-3" />
							<p className="text-base font-semibold text-foreground">Belum ada materi tersedia</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
