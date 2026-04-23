import type { AccessType, CourseType } from "@prisma/client";

export type PaginatedResult = {
	data: Array<{
		id: string;
		courseId: string;
		title: string;
		description: string;
		courseType: CourseType;
		videoUrl?: string | null;
		downloadUrl?: string | null;
		sortOrder: number;
		createdAt: Date;
		updatedAt: Date;
		course: {
			courseName: string;
			accessType: AccessType;
		};
	}>;
	total: number;
	pageCount: number;
};
