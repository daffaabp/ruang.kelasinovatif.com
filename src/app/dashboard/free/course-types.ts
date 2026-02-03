import type { CourseType } from "@prisma/client";

export type PaginatedResult = {
	data: Array<{
		id: string;
		title: string;
		description: string;
		courseType: CourseType;
		videoUrl?: string | null;
		downloadUrl?: string | null;
		course: {
			courseName: string;
		};
	}>;
	total: number;
	pageCount: number;
};
