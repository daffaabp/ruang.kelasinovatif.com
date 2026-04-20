import { getSession } from "@/lib/sessions";
import { BookOpen, GraduationCap, PlayCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getFreeCoursesAction } from "./course-actions";
import { CourseGrid } from "./course-grid";
import type { PaginatedResult } from "./course-types";
import { CourseType } from "@prisma/client";

function GridSkeleton() {
	return (
		<div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-border bg-muted/20">
			<div className="flex items-center gap-2 text-muted-foreground text-sm">
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
				Memuat materi...
			</div>
		</div>
	);
}

export default async function FreeDashboardPage() {
	const session = await getSession();

	if (!session.userId) {
		redirect("/auth/login");
	}

	const result = await getFreeCoursesAction({});

	if (!result || !("data" in result) || !result.data) {
		throw new Error("Failed to fetch courses");
	}

	const paginatedResult = result.data as PaginatedResult;
	const total = paginatedResult.data.length;
	const videoCount = paginatedResult.data.filter(
		(c) => c.courseType === CourseType.VIDEO,
	).length;
	const ebookCount = paginatedResult.data.filter(
		(c) => c.courseType === CourseType.EBOOK,
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
						<GraduationCap className="h-5 w-5" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Akses berbagai materi pembelajaran dalam bentuk video dan e-book
						</p>
					</div>
				</div>

				{/* Stats */}
				{total > 0 && (
					<div className="flex items-center gap-4 shrink-0 text-sm">
						{videoCount > 0 && (
							<div className="flex items-center gap-1.5 text-emerald-600 font-medium">
								<PlayCircle className="h-4 w-4" />
								{videoCount} video
							</div>
						)}
						{ebookCount > 0 && (
							<div className="flex items-center gap-1.5 text-amber-600 font-medium">
								<BookOpen className="h-4 w-4" />
								{ebookCount} e-book
							</div>
						)}
					</div>
				)}
			</div>

			{/* Grid */}
			<Suspense fallback={<GridSkeleton />}>
				<CourseGrid initialData={paginatedResult} />
			</Suspense>
		</div>
	);
}
