import { getSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPremiumCoursesAction } from "./actions/courses";
import { CourseGrid } from "./components/course-grid";

export default async function PremiumDashboardPage() {
	const session = await getSession();

	if (!session.userId) {
		redirect("/auth/login");
	}

	// 1. Data Fetching
	const result = await getPremiumCoursesAction({
		userId: session.userId,
	});

	if (!result || !("data" in result) || !result.data) {
		throw new Error("Failed to fetch courses");
	}

	const paginatedResult = result.data.data;

	// 2. Component Layout
	return (
		<div className="space-y-4">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<p className="text-lg text-slate-500 font-medium">
						Akses materi pembelajaran premium berdasarkan course yang Anda ikuti
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
					<CourseGrid initialData={paginatedResult} userId={session.userId} />
				</Suspense>
			</div>
		</div>
	);
}
