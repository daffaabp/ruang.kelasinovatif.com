import type { AccessType } from "@prisma/client";

export type UserWithProfile = {
	id: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
	isAdmin: boolean;
	UserProfile: {
		firstName: string;
		lastName: string;
		phone: string;
		institution: string;
		address: string;
		city: string;
		province: string;
	} | null;
	UserCourseDetails?: Array<{
		id: string;
		courseDetailId: string;
		courseDetail: {
			id: string;
			title: string;
			course: {
				id: string;
				courseName: string;
				accessType: AccessType;
			};
		};
	}>;
};

export type PaginatedResult = {
	data: Array<UserWithProfile>;
	total: number;
	pageCount: number;
};
