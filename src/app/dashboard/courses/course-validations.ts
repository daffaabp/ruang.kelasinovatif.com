import { z } from "zod";

export const courseFormSchema = z.object({
	courseName: z.string().min(1, "Course name is required"),
	courseDescription: z
		.string()
		.min(10, "Description must be at least 10 characters"),
	price: z
		.union([z.string(), z.undefined()])
		.optional()
		.transform((val) => {
			if (!val || val === "") return null;
			return val;
		}),
	linkPayment: z
		.union([z.string(), z.undefined()])
		.optional()
		.transform((val) => {
			if (!val || val === "") return null;
			return val;
		}),
});

export const updateCourseSchema = courseFormSchema.extend({
	id: z.string().min(1, "Course ID is required"),
});

export const deleteCourseSchema = z.object({
	id: z.string().min(1, "Course ID is required"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;
export type DeleteCourseValues = z.infer<typeof deleteCourseSchema>;
