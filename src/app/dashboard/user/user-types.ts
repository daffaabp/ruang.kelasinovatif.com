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
	UserCourses?: Array<{
		id: string;
		courseId: string;
		course: {
			id: string;
			courseName: string;
		};
	}>;
};

export type PaginatedResult = {
	data: Array<UserWithProfile>;
	total: number;
	pageCount: number;
};
