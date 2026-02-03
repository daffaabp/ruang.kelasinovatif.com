"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BookX } from "lucide-react";
import { useCourseGrid } from "../../hooks/use-course-grid";
import type { CourseGridProps } from "../../types/course";
import { CourseCard } from "../course-card";
import { CourseFilter } from "./course-filter";

export function CourseGrid({ initialData, userId }: CourseGridProps) {
	const { loading, selectedCourseType, setSelectedCourseType, groupedCourses } =
		useCourseGrid({ initialData, userId });

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map(() => (
					<Skeleton
						key={crypto.randomUUID()}
						className="h-[200px] rounded-lg"
					/>
				))}
			</div>
		);
	}

	const isEmpty = Object.keys(groupedCourses).length === 0;

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<CourseFilter
					selectedCourseType={selectedCourseType}
					onCourseTypeSelect={setSelectedCourseType}
				/>
			</div>

			{/* Course Grid or Empty State */}
			{isEmpty ? (
				<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
					<BookX className="h-12 w-12 mb-4" />
					<p className="text-lg font-medium">
						Belum ada materi premium yang Anda miliki
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{Object.entries(groupedCourses).map(([courseName, courses]) => (
						<div key={courseName} className="space-y-4">
							<div className="border-b pb-2">
								<div className="flex items-center justify-between">
									<h3 className="text-xl font-semibold tracking-tight">{courseName}</h3>
									<span className="text-sm text-muted-foreground">
										{courses.length} materi
									</span>
								</div>
							</div>
							<div className="space-y-4">
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
					))}
				</div>
			)}
		</div>
	);
}
