"use server";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PaginatedResult } from "./course-types";
import { courseFormSchema, updateCourseSchema } from "./course-validations";

export const getCoursesAction = actionClient
	.schema(
		z.object({
			page: z.number().min(1).default(1),
			perPage: z.number().min(1).default(5),
			search: z.string().optional(),
			sortField: z.enum(["courseName", "id"]).optional(),
			sortOrder: z.enum(["asc", "desc"]).optional(),
		}),
	)
	.action(async ({ parsedInput }): Promise<PaginatedResult> => {
		try {
			const {
				page,
				perPage,
				search,
				sortField = "courseName",
				sortOrder = "asc",
			} = parsedInput;
			const skip = (page - 1) * perPage;

			const where = search
				? {
						courseName: {
							contains: search
						},
					}
				: {};

			const [courses, total] = await Promise.all([
				prisma.courses.findMany({
					where,
					select: {
						id: true,
						courseName: true,
						courseDescription: true,
						price: true,
						linkPayment: true,
					},
					skip,
					take: perPage,
					orderBy: {
						[sortField]: sortOrder,
					},
				}),
				prisma.courses.count({ where }),
			]);

			const result: PaginatedResult = {
				data: courses,
				total,
				pageCount: Math.ceil(total / perPage),
			};

			return result;
		} catch (error) {
			console.error("Get courses error:", error);
			throw error;
		}
	});

export const createCourseAction = actionClient
	.schema(courseFormSchema)
	.action(async ({ parsedInput }) => {
		try {
			const { courseName, courseDescription, price, linkPayment } = parsedInput;

			const course = await prisma.courses.create({
				data: {
					courseName,
					courseDescription,
					price,
					linkPayment,
				},
			});

			revalidatePath("/dashboard/courses");
			return {
				success: true,
				data: course,
			};
		} catch (error) {
			console.error("Create course error:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to create course",
			};
		}
	});

export const deleteCourseAction = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput }) => {
		try {
			const course = await prisma.courses.findUnique({
				where: { id: parsedInput.id },
				include: {
					UserCourses: true,
					CourseDetails: true
				}
			});

			if (!course) {
				return {
					data: null,
					error: { 
						serverError: "Course tidak ditemukan",
						type: "NOT_FOUND"
					}
				};
			}

			// Check UserCourses
			if (course.UserCourses.length > 0) {
				return {
					data: null,
					error: {
						serverError: `Course "${course.courseName}" tidak dapat dihapus karena masih digunakan oleh ${course.UserCourses.length} user aktif. Hapus user dari course terlebih dahulu.`,
						type: "COURSE_IN_USE",
						userCount: course.UserCourses.length
					}
				};
			}

			// Check CourseDetails
			if (course.CourseDetails.length > 0) {
				return {
					data: null,
					error: {
						serverError: `Course "${course.courseName}" tidak dapat dihapus karena masih memiliki ${course.CourseDetails.length} detail materi. Hapus semua detail materi terlebih dahulu.`,
						type: "HAS_COURSE_DETAILS",
						detailCount: course.CourseDetails.length
					}
				};
			}

			await prisma.courses.delete({
				where: { id: parsedInput.id }
			});

			return {
				data: { 
					message: `Course "${course.courseName}" berhasil dihapus`,
					type: "SUCCESS"
				},
				error: null
			};
		} catch (error) {
			console.error("Delete error:", error);
			return {
				data: null,
				error: { 
					serverError: "Terjadi kesalahan saat menghapus course",
					type: "UNKNOWN_ERROR"
				}
			};
		}
	});

export const updateCourseAction = actionClient
	.schema(updateCourseSchema)
	.action(async ({ parsedInput }) => {
		try {
			const { id, courseName, courseDescription, price, linkPayment } =
				parsedInput;

			const course = await prisma.courses.update({
				where: { id },
				data: {
					courseName,
					courseDescription,
					price,
					linkPayment,
				},
			});

			revalidatePath("/dashboard/courses");
			return {
				success: true,
				data: course,
			};
		} catch (error) {
			console.error("Update course error:", error);
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to update course",
			};
		}
	});
