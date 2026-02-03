import { Suspense } from "react";
import { getCoursesAction } from "./course-actions";
import { CourseAddModal } from "./course-add-modal";
import { CourseTable } from "./course-table";
import type { PaginatedResult } from "./course-types";

export default async function CoursesPage() {
	// 1. Data Fetching
	const result = await getCoursesAction({
		page: 1,
		perPage: 5,
	});

	if (!result || !("data" in result) || !result.data) {
		throw new Error("Failed to fetch courses");
	}

	const paginatedResult = result.data as PaginatedResult;

	// 2. Component Layout
	return (
		<div className="space-y-4">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
						Courses
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your courses and their details
					</p>
				</div>
				<CourseAddModal courses={paginatedResult} />
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
					<CourseTable initialData={paginatedResult} />
				</Suspense>
			</div>
		</div>
	);
}
