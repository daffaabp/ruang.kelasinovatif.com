"use client";

import type { CourseDetail } from "../../types/course";
import { CourseCard } from "../course-card";

interface SubscribedCourseListProps {
	groupedCourses: Record<string, CourseDetail[]>;
}

export function SubscribedCourseList({
	groupedCourses,
}: SubscribedCourseListProps) {
	if (Object.keys(groupedCourses).length === 0) {
		return (
			<div className="text-center py-12 bg-muted/50 rounded-lg">
				<div className="max-w-md mx-auto space-y-4">
					<h3 className="text-lg font-semibold">
						Belum ada course yang diikuti
					</h3>
					<p className="text-sm text-muted-foreground">
						Silahkan pilih course yang tersedia untuk mulai belajar
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{Object.entries(groupedCourses).map(([courseName, courses]) => (
				<div key={courseName} className="space-y-4">
					<h2 className="text-lg font-semibold">{courseName}</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{courses.map((course) => (
							<CourseCard
								key={course.id}
								title={course.title}
								description={course.description}
								courseType={course.courseType}
								courseName={course.course.courseName}
								videoUrl={course.videoUrl}
								downloadUrl={course.downloadUrl}
								id={course.id}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
