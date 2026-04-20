"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toTitleCase } from "@/lib/utils";
import { CourseType } from "@prisma/client";
import { BookOpen, BookX, PlayCircle, Search } from "lucide-react";
import { useState } from "react";
import { useCourseGrid } from "../../hooks/use-course-grid";
import type { CourseGridProps } from "../../types/course";
import { CourseCard } from "../course-card";
import { CourseFilter } from "./course-filter";

export function CourseGrid({ initialData, userId }: CourseGridProps) {
	const { loading, selectedCourseType, setSelectedCourseType, groupedCourses } =
		useCourseGrid({ initialData, userId });

	const [searchQuery, setSearchQuery] = useState("");

	if (loading) {
		return (
			<div className="space-y-8">
				{Array.from({ length: 2 }).map((_, groupIdx) => (
					<div key={groupIdx} className="space-y-3">
						<Skeleton className="h-14 rounded-xl w-full" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{Array.from({ length: 2 }).map((_, cardIdx) => (
								<Skeleton key={cardIdx} className="h-[180px] rounded-2xl" />
							))}
						</div>
					</div>
				))}
			</div>
		);
	}

	const isEmpty = Object.keys(groupedCourses).length === 0;

	// Filter by search query
	const filteredGroups = Object.entries(groupedCourses).reduce(
		(acc, [courseName, courses]) => {
			const query = searchQuery.toLowerCase();
			if (!query) {
				acc[courseName] = courses;
				return acc;
			}
			const matchingCourses = courses.filter(
				(c) =>
					c.title.toLowerCase().includes(query) ||
					c.description.toLowerCase().includes(query) ||
					courseName.toLowerCase().includes(query),
			);
			if (matchingCourses.length > 0) {
				acc[courseName] = matchingCourses;
			}
			return acc;
		},
		{} as typeof groupedCourses,
	);

	const totalMaterials = Object.values(filteredGroups).reduce(
		(sum, courses) => sum + courses.length,
		0,
	);
	const isSearchEmpty = searchQuery && Object.keys(filteredGroups).length === 0;

	return (
		<div className="space-y-5">
			{/* Search + Filter Bar */}
			<div className="flex flex-col sm:flex-row gap-3">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						type="text"
						placeholder="Cari rekaman berdasarkan nama atau tanggal..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 h-11 text-sm rounded-xl border-border/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-200"
					/>
				</div>

				{/* Filter Pills */}
				<CourseFilter
					selectedCourseType={selectedCourseType}
					onCourseTypeSelect={setSelectedCourseType}
				/>
			</div>

			{/* Result count */}
			{!isEmpty && (
				<p className="text-sm text-muted-foreground">
					{searchQuery ? (
						<>
							Menampilkan{" "}
							<span className="font-semibold text-foreground">{totalMaterials}</span>{" "}
							hasil untuk &ldquo;{searchQuery}&rdquo;
						</>
					) : (
						<>
							<span className="font-semibold text-foreground">{totalMaterials}</span>{" "}
							rekaman tersedia
						</>
					)}
				</p>
			)}

			{/* Empty states */}
			{isEmpty ? (
				<div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border bg-muted/30">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
						<BookX className="h-8 w-8 text-muted-foreground" />
					</div>
					<p className="text-lg font-semibold text-foreground">
						Belum ada materi premium
					</p>
					<p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
						Materi akan muncul di sini setelah Anda bergabung ke sebuah course.
					</p>
				</div>
			) : isSearchEmpty ? (
				<div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border bg-muted/20">
					<Search className="h-10 w-10 text-muted-foreground mb-3" />
					<p className="text-base font-semibold text-foreground">
						Rekaman tidak ditemukan
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						Coba gunakan kata kunci lain
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{Object.entries(filteredGroups).map(([courseName, courses]) => {
						const hasMultiple = courses.length > 1;
						const videoCount = courses.filter(
							(c) => c.courseType === CourseType.VIDEO,
						).length;
						const ebookCount = courses.filter(
							(c) => c.courseType === CourseType.EBOOK,
						).length;

						return (
							<div key={courseName} className={hasMultiple ? "mt-4 pt-2" : ""}>
								{/*
								 * Section header only when a course has multiple materials.
								 * When 1 material: the card title already carries all info — no duplication.
								 */}
								{hasMultiple && (
									<div className="flex items-start gap-3 mb-4 pb-3 border-b border-border/60">
										<div className="flex-1 min-w-0">
											<h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">
												{toTitleCase(courseName)}
											</h3>
											<div className="flex items-center gap-3 mt-1">
												{videoCount > 0 && (
													<span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
														<PlayCircle className="h-3.5 w-3.5" />
														{videoCount} rekaman video
													</span>
												)}
												{ebookCount > 0 && (
													<span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
														<BookOpen className="h-3.5 w-3.5" />
														{ebookCount} e-book
													</span>
												)}
											</div>
										</div>
									</div>
								)}

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{courses.map((courseDetail) => (
										<CourseCard
											key={courseDetail.id}
											id={courseDetail.id}
											title={courseDetail.title}
											description={courseDetail.description}
											courseType={courseDetail.courseType}
											courseName={courseDetail.course.courseName}
											videoUrl={courseDetail.videoUrl}
											downloadUrl={courseDetail.downloadUrl}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
