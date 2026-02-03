import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { getDetailCoursesAction } from "./detailcourse-actions";
import { DetailCourseAddModal } from "./detailcourse-add-modal";
import { DetailCourseTable } from "./detailcourse-table";
import type { PaginatedResult } from "./detailcourse-types";

interface PageProps {
	searchParams: Promise<{ courseId?: string }>;
}

export default async function DetailCoursePage({ searchParams }: PageProps) {
	// Wait for searchParams to resolve
	const resolvedParams = await searchParams;
	const courseId = resolvedParams.courseId;

	// 1. Data Fetching
	try {
		const [result, courses] = await Promise.all([
			getDetailCoursesAction({
				page: 1,
				perPage: 5,
				courseId,
			}),
			prisma.courses.findMany({
				select: {
					id: true,
					courseName: true,
				},
				orderBy: {
					courseName: "asc",
				},
			}),
		]);

		if (!result || !("data" in result) || !result.data) {
			throw new Error("Failed to fetch course details");
		}

		const paginatedResult = result.data as PaginatedResult;
		const courseOptions = courses.map((course) => ({
			id: course.id,
			courseName: course.courseName,
		}));

		// 2. Component Layout
		return (
			<div className="space-y-4">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
							Course Details
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Kelola detail materi untuk setiap course
						</p>
					</div>
					<DetailCourseAddModal
						details={paginatedResult}
						courseOptions={courseOptions}
					/>
				</div>

				{/* Table Section with Loading State */}
				<div>
					<Suspense
						fallback={
							<div className="flex items-center justify-center h-32">
								<div className="text-muted-foreground">Memuat...</div>
							</div>
						}
					>
						<DetailCourseTable
							initialData={paginatedResult}
							courseOptions={courseOptions}
							selectedCourseId={courseId}
						/>
					</Suspense>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error in DetailCoursePage:", error);
		return (
			<div className="space-y-4">
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					<p>Terjadi kesalahan saat memuat data. Silakan coba lagi nanti.</p>
				</div>
			</div>
		);
	}
}
