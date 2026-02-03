import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getFreeCoursesAction } from "./course-actions";
import { CourseGrid } from "./course-grid";
import type { PaginatedResult } from "./course-types";

export default async function FreeDashboardPage() {
	const session = await getSession();

	if (!session.userId) {
		redirect("/auth/login");
	}

	// 1. Data Fetching
	const result = await getFreeCoursesAction({});

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
						Materi Gratis
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Akses berbagai materi pembelajaran gratis dalam bentuk video dan
						e-book
					</p>
				</div>
			</div>

			{/* Grid Section with Loading State */}
			<div>
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-32">
							<div className="text-muted-foreground">Memuat...</div>
						</div>
					}
				>
					<CourseGrid initialData={paginatedResult} />
				</Suspense>
			</div>
		</div>
	);
}
