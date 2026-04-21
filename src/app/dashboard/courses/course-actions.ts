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
			accessFilter: z.enum(["all", "free", "premium"]).optional(),
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
				accessFilter = "all",
				sortField = "courseName",
				sortOrder = "asc",
			} = parsedInput;
			const skip = (page - 1) * perPage;
			const normalizedSearch = (search ?? "").trim().replace(/\s+/g, " ");
			const searchTerms = normalizedSearch
				.split(" ")
				.map((term) => term.trim())
				.filter(Boolean);

			const searchWhere = searchTerms.length
				? {
						AND: searchTerms.map((term) => ({
							OR: [
								{ courseName: { contains: term } },
								{ courseDescription: { contains: term } },
							],
						})),
					}
				: {};

			const accessWhere =
				accessFilter === "free"
					? { accessType: "FREE" as const }
					: accessFilter === "premium"
						? { accessType: "PREMIUM" as const }
						: {};

			const whereClauses = [searchWhere, accessWhere].filter(
				(clause) => Object.keys(clause).length > 0,
			);
			const where = whereClauses.length > 0 ? { AND: whereClauses } : {};

			const [courses, total] = await Promise.all([
				prisma.courses.findMany({
					where,
					select: {
						id: true,
						courseName: true,
						courseDescription: true,
						price: true,
						linkPayment: true,
						accessType: true,
						thumbnailUrl: true,
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
			const {
				courseName,
				courseDescription,
				accessType,
				price,
				linkPayment,
				thumbnailUrl,
			} = parsedInput;

			const course = await prisma.courses.create({
				data: {
					courseName,
					courseDescription,
					accessType,
					price,
					linkPayment,
					thumbnailUrl,
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
					error instanceof Error ? error.message : "Gagal membuat jenis course",
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
					CourseDetails: {
						include: {
							_count: {
								select: {
									UserCourseDetails: true,
								},
							},
						},
					},
				},
			});

			if (!course) {
				return {
					data: null,
					error: {
						serverError: "Jenis course tidak ditemukan",
						type: "NOT_FOUND",
					},
				};
			}

			const totalUserAccesses = course.CourseDetails.reduce(
				(sum, d) => sum + d._count.UserCourseDetails,
				0,
			);

			if (totalUserAccesses > 0) {
				return {
					data: null,
					error: {
						serverError: `Jenis course "${course.courseName}" tidak dapat dihapus karena masih digunakan oleh ${totalUserAccesses} akses user aktif. Hapus akses user terlebih dahulu.`,
						type: "COURSE_IN_USE",
						userCount: totalUserAccesses,
					},
				};
			}

			if (course.CourseDetails.length > 0) {
				return {
					data: null,
					error: {
						serverError: `Jenis course "${course.courseName}" tidak dapat dihapus karena masih memiliki ${course.CourseDetails.length} rekaman materi. Hapus semua rekaman terlebih dahulu.`,
						type: "HAS_COURSE_DETAILS",
						detailCount: course.CourseDetails.length,
					},
				};
			}

			await prisma.courses.delete({
				where: { id: parsedInput.id },
			});

			return {
				data: {
					message: `Jenis course "${course.courseName}" berhasil dihapus`,
					type: "SUCCESS",
				},
				error: null,
			};
		} catch (error) {
			console.error("Delete error:", error);
			return {
				data: null,
				error: {
					serverError: "Terjadi kesalahan saat menghapus jenis course",
					type: "UNKNOWN_ERROR",
				},
			};
		}
	});

export const updateCourseAction = actionClient
	.schema(updateCourseSchema)
	.action(async ({ parsedInput }) => {
		try {
			const {
				id,
				courseName,
				courseDescription,
				accessType,
				price,
				linkPayment,
				thumbnailUrl,
			} = parsedInput;

			const course = await prisma.courses.update({
				where: { id },
				data: {
					courseName,
					courseDescription,
					accessType,
					price,
					linkPayment,
					thumbnailUrl,
				},
			});

			revalidatePath("/dashboard/courses");
			revalidatePath(`/dashboard/courses/${id}`);
			return {
				success: true,
				data: course,
			};
		} catch (error) {
			console.error("Update course error:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Gagal memperbarui jenis course",
			};
		}
	});
