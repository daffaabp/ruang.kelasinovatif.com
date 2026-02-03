import type { CourseType } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { getPremiumCoursesAction } from "../actions/courses";
import type { PaginatedResult } from "../types/course";

interface UseCourseGridProps {
	initialData: PaginatedResult;
	userId: string;
}

export function useCourseGrid({ initialData, userId }: UseCourseGridProps) {
	const [data, setData] = useState<PaginatedResult>(initialData);
	const [loading, setLoading] = useState(false);
	const [selectedCourseType, setSelectedCourseType] = useState<
		CourseType | "ALL"
	>("ALL");

	const fetchUserCourses = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getPremiumCoursesAction({
				userId,
				courseType:
					selectedCourseType === "ALL" ? undefined : selectedCourseType,
			});
			if (result?.data) {
				setData(result.data.data);
			}
		} catch (error) {
			console.error("Error fetching user courses:", error);
		} finally {
			setLoading(false);
		}
	}, [userId, selectedCourseType]);

	useEffect(() => {
		fetchUserCourses();
	}, [fetchUserCourses]);

	// Group courses by courseName
	const groupedCourses = data.data.reduce(
		(acc, course) => {
			const courseName = course.course.courseName;
			if (!acc[courseName]) {
				acc[courseName] = [];
			}
			acc[courseName].push(course);
			return acc;
		},
		{} as Record<string, typeof data.data>,
	);

	return {
		data,
		loading,
		selectedCourseType,
		setSelectedCourseType,
		groupedCourses,
	};
}
