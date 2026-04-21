import type { CourseType } from "@prisma/client";

export interface CourseOption {
	id: string;
	courseName: string;
	price: string | null;
	linkPayment: string | null;
}

export interface PaginatedResult {
	data: Array<CourseDetail>;
	total: number;
	pageCount: number;
}

export interface CourseDetail {
	id: string;
	title: string;
	description: string;
	courseType: CourseType;
	videoUrl: string | null;
	downloadUrl: string | null;
	course: CourseOption;
}

export interface AvailableCourse extends CourseOption {
	courseDetails: Array<{
		id: string;
		title: string;
		description: string;
		courseType: CourseType;
	}>;
}

export interface CourseGridProps {
	initialData: PaginatedResult;
	userId: string;
}

export interface AvailableCoursesResult {
	subscribedDetailIds: string[];
	allCourses: AvailableCourse[];
}
