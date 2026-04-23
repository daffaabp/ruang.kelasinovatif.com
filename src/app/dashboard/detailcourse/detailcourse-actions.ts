"use server";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { createNotification } from "@/app/dashboard/notifications/notification-actions";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { CourseType } from "@prisma/client";
import { z } from "zod";
import type { PaginatedResult } from "./detailcourse-types";
import {
	detailCourseFormSchema,
	updateDetailCourseSchema,
} from "./detailcourse-validations";

export const getDetailCoursesAction = actionClient
	.schema(
		z.object({
			page: z.number().min(1).default(1),
			perPage: z.number().min(1).default(5),
			search: z.string().optional(),
			courseTypeFilter: z.nativeEnum(CourseType).optional(),
			accessFilter: z.enum(["all", "free", "premium"]).optional(),
			sortField: z.enum(["title", "updatedAt"]).optional(),
			sortOrder: z.enum(["asc", "desc"]).optional(),
			courseId: z.string().optional(),
		}),
	)
	.action(async ({ parsedInput }): Promise<PaginatedResult> => {
		try {
			const {
				page,
				perPage,
				search,
				courseTypeFilter,
				accessFilter = "all",
				sortField = "updatedAt",
				sortOrder = "desc",
				courseId,
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
								{ title: { contains: term } },
								{ description: { contains: term } },
								{
									course: {
										courseName: { contains: term },
									},
								},
							],
						})),
					}
				: {};
			const accessWhere =
				accessFilter === "free"
					? { course: { accessType: "FREE" as const } }
					: accessFilter === "premium"
						? { course: { accessType: "PREMIUM" as const } }
						: {};

			const whereClauses = [
				searchWhere,
				courseId ? { courseId } : {},
				courseTypeFilter ? { courseType: courseTypeFilter } : {},
				accessWhere,
			].filter((clause) => Object.keys(clause).length > 0);
			const where = whereClauses.length > 0 ? { AND: whereClauses } : {};

		const orderByClause = courseId
			? [{ sortOrder: "asc" as const }, { [sortField]: sortOrder }]
			: [{ [sortField]: sortOrder }];

		const [details, total] = await Promise.all([
			prisma.courseDetails.findMany({
				where,
				skip,
				take: perPage,
				orderBy: orderByClause,
				include: {
					course: {
						select: {
							courseName: true,
							accessType: true,
						},
					},
				},
			}),
			prisma.courseDetails.count({ where }),
		]);

			const result: PaginatedResult = {
				data: details,
				total,
				pageCount: Math.ceil(total / perPage),
			};

			return result;
		} catch (error) {
			console.error("Get course details error:", error);
			throw error;
		}
	});

export const createDetailCourseAction = actionClient
	.schema(detailCourseFormSchema)
	.action(async ({ parsedInput }) => {
		try {
			const newDetail = await prisma.courseDetails.create({
				data: {
					courseId: parsedInput.courseId,
					title: parsedInput.title,
					description: parsedInput.description,
					courseType: parsedInput.courseType,
					videoUrl: parsedInput.videoUrl,
					downloadUrl: parsedInput.downloadUrl,
				},
				include: {
					course: {
						select: {
							courseName: true,
							accessType: true,
						},
					},
				},
			});

		revalidatePath("/dashboard/detailcourse");
		await createNotification(
			"NEW_CONTENT",
			"Rekaman Baru Ditambahkan",
			`"${newDetail.title}" telah ditambahkan ke ${newDetail.course.courseName}.`,
			{ detailId: newDetail.id, courseId: newDetail.courseId },
		);

		return {
			success: true,
			data: {
				...newDetail,
				createdAt: new Date(newDetail.createdAt),
				updatedAt: new Date(newDetail.updatedAt),
			},
		};
	} catch (error) {
		console.error("Create course detail error:", error);

			if (error instanceof Error) {
				return { success: false, error: error.message };
			}

			return {
				success: false,
				error: "Gagal membuat detail course karena kesalahan database",
			};
		}
	});

export const deleteDetailCourseAction = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput }) => {
		try {
			await prisma.$connect();

			await prisma.courseDetails.delete({
				where: { id: parsedInput.id },
			});

			await prisma.$disconnect();
			revalidatePath("/dashboard/detailcourse");
			return {
				data: { message: "Detail course berhasil dihapus" },
				error: null,
			};
		} catch (error) {
			await prisma.$disconnect();
			console.error("Delete error:", error);
			return {
				data: null,
				error: { serverError: "Gagal menghapus detail course" },
			};
		}
	});

export const updateSortOrderAction = actionClient
	.schema(
		z.object({
			items: z.array(
				z.object({ id: z.string(), sortOrder: z.number() }),
			),
			courseId: z.string(),
		}),
	)
	.action(async ({ parsedInput }) => {
		try {
			await prisma.$transaction(
				parsedInput.items.map(({ id, sortOrder }) =>
					prisma.courseDetails.update({
						where: { id },
						data: { sortOrder },
					}),
				),
			);
			revalidatePath(`/dashboard/courses/${parsedInput.courseId}`);
			return { success: true };
		} catch (error) {
			console.error("Update sort order error:", error);
			return { success: false, error: "Gagal menyimpan urutan" };
		}
	});

export const updateDetailCourseAction = actionClient
	.schema(updateDetailCourseSchema)
	.action(async ({ parsedInput }) => {
		try {
			await prisma.$connect();

			const detail = await prisma.courseDetails.findUnique({
				where: { id: parsedInput.id },
			});

			if (!detail) {
				returnValidationErrors(updateDetailCourseSchema, {
					_errors: ["Detail course tidak ditemukan"],
				});
			}

			await prisma.courseDetails.update({
				where: { id: parsedInput.id },
				data: {
					courseId: parsedInput.courseId,
					title: parsedInput.title,
					description: parsedInput.description,
					courseType: parsedInput.courseType,
					videoUrl: parsedInput.videoUrl,
					downloadUrl: parsedInput.downloadUrl,
					updatedAt: new Date(),
				},
			});

			await prisma.$disconnect();
			revalidatePath("/dashboard/detailcourse");
			return {
				message: "Detail course berhasil diperbarui",
			};
		} catch (error) {
			await prisma.$disconnect();
			console.error("Update error:", error);
			return returnValidationErrors(updateDetailCourseSchema, {
				_errors: ["Gagal memperbarui detail course"],
			});
		}
	});
