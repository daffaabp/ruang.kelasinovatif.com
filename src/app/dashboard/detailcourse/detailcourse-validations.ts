import { CourseType } from "@prisma/client";
import { z } from "zod";

export const detailCourseFormSchema = z.object({
	courseId: z.string().min(1, "Course is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	courseType: z.nativeEnum(CourseType, {
		required_error: "Course type is required",
	}),
	videoUrl: z.string().nullable().optional(),
	downloadUrl: z.string().nullable().optional(),
});

export const updateDetailCourseSchema = detailCourseFormSchema.extend({
	id: z.string().min(1, "Course Detail ID is required"),
});

export const deleteDetailCourseSchema = z.object({
	id: z.string().min(1, "Course Detail ID is required"),
});

export type DetailCourseFormValues = z.infer<typeof detailCourseFormSchema>;
export type UpdateDetailCourseValues = z.infer<typeof updateDetailCourseSchema>;
export type DeleteDetailCourseValues = z.infer<typeof deleteDetailCourseSchema>;
