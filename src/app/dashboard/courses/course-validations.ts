import { AccessType } from "@prisma/client";
import { z } from "zod";

export const courseFormSchema = z.object({
	courseName: z.string().min(1, "Nama jenis course harus diisi"),
	courseDescription: z
		.string()
		.min(10, "Deskripsi minimal 10 karakter"),
	accessType: z.nativeEnum(AccessType).default(AccessType.PREMIUM),
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
	thumbnailUrl: z
		.union([z.string(), z.undefined()])
		.optional()
		.transform((val) => {
			if (!val || val === "") return null;
			return val;
		}),
});

export const updateCourseSchema = courseFormSchema.extend({
	id: z.string().min(1, "Course ID harus diisi"),
});

export const deleteCourseSchema = z.object({
	id: z.string().min(1, "Course ID harus diisi"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;
export type DeleteCourseValues = z.infer<typeof deleteCourseSchema>;
