import { getSession } from "@/lib/sessions";
import { Crown, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPremiumCoursesAction } from "./actions/courses";
import { CourseGrid } from "./components/course-grid";

function CourseGridSkeleton() {
	return (
		<div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-border bg-muted/20">
			<div className="flex items-center gap-2 text-muted-foreground text-sm">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
				Memuat materi...
			</div>
		</div>
	);
}

export default async function PremiumDashboardPage() {
	const session = await getSession();

	if (!session.userId) {
		redirect("/auth/login");
	}

	const result = await getPremiumCoursesAction({
		userId: session.userId,
	});

	if (!result || !("data" in result) || !result.data) {
		throw new Error("Failed to fetch courses");
	}

	const paginatedResult = result.data.data;
	const totalCourses = paginatedResult.data.length;
	const totalGroups = new Set(paginatedResult.data.map((c) => c.course.courseName)).size;

	return (
		<div className="space-y-6">
			{/* Hero Header */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-lg">
				{/* Background decoration */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
					<div className="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-white" />
				</div>

				<div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
							<Crown className="h-6 w-6 text-yellow-300" />
						</div>
						<div>
							<div className="flex items-center gap-2 mb-0.5">
								<h1 className="text-xl font-bold tracking-tight">Materi Premium</h1>
								<Sparkles className="h-4 w-4 text-yellow-300" />
							</div>
							<p className="text-sm text-emerald-100/90 leading-relaxed max-w-sm">
								Akses eksklusif semua rekaman dan materi berdasarkan course yang Anda ikuti
							</p>
						</div>
					</div>

					{/* Stats */}
					{totalCourses > 0 && (
						<div className="flex items-center gap-4 sm:gap-6 shrink-0">
							<div className="text-center">
								<div className="text-2xl font-bold">{totalCourses}</div>
								<div className="text-xs text-emerald-200">Materi</div>
							</div>
							<div className="h-8 w-px bg-white/20" />
							<div className="text-center">
								<div className="text-2xl font-bold">{totalGroups}</div>
								<div className="text-xs text-emerald-200">Course</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Course Grid */}
			<Suspense fallback={<CourseGridSkeleton />}>
				<CourseGrid initialData={paginatedResult} userId={session.userId} />
			</Suspense>
		</div>
	);
}
