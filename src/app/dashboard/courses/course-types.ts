export type Course = {
	id: string;
	courseName: string;
	courseDescription: string;
	price: string | null;
	linkPayment: string | null;
};

export type PaginatedResult = {
	data: Course[];
	total: number;
	pageCount: number;
};
