"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { CourseType } from "@prisma/client";
import { z } from "zod";
import type { CourseOption, PaginatedResult } from "../types/course";

export const getCoursesAction = actionClient.action(
	async (): Promise<CourseOption[]> => {
		try {
			const courses = await prisma.courses.findMany({
				where: {
					accessType: "PREMIUM",
				},
				select: {
					id: true,
					courseName: true,
					price: true,
					linkPayment: true,
				},
				orderBy: {
					courseName: "asc",
				},
			});

			return courses;
		} catch (error) {
			console.error("Get courses error:", error);
			throw error;
		}
	},
);

// Returns premium course categories (kategori) with their course details (rekaman),
// digunakan di admin UI saat admin memilih detail apa saja yang bisa diakses user.
export const getPremiumCourseDetailsGroupedAction = actionClient.action(
	async () => {
		try {
			const categories = await prisma.courses.findMany({
				where: {
					accessType: "PREMIUM",
				},
				select: {
					id: true,
					courseName: true,
					CourseDetails: {
						select: {
							id: true,
							title: true,
							courseType: true,
						},
						orderBy: {
							createdAt: "desc",
						},
					},
				},
				orderBy: {
					courseName: "asc",
				},
			});

			return categories.map((category) => ({
				id: category.id,
				courseName: category.courseName,
				details: category.CourseDetails,
			}));
		} catch (error) {
			console.error("Get premium course details grouped error:", error);
			throw error;
		}
	},
);

export const getUserCoursesAction = actionClient
	.schema(
		z.object({
			userId: z.string(),
		}),
	)
	.action(async ({ parsedInput }): Promise<CourseOption[]> => {
		try {
			const { userId } = parsedInput;

			// Ambil semua courseDetail yang user miliki aksesnya, lalu distinct berdasarkan course parent.
			const userAccesses = await prisma.userCourseDetails.findMany({
				where: {
					userId,
					courseDetail: {
						course: {
							accessType: "PREMIUM",
						},
					},
				},
				select: {
					courseDetail: {
						select: {
							course: {
								select: {
									id: true,
									courseName: true,
									price: true,
									linkPayment: true,
								},
							},
						},
					},
				},
			});

			const uniqueCoursesMap = new Map<string, CourseOption>();
			for (const ua of userAccesses) {
				const c = ua.courseDetail.course;
				if (!uniqueCoursesMap.has(c.id)) {
					uniqueCoursesMap.set(c.id, c);
				}
			}

			return Array.from(uniqueCoursesMap.values()).sort((a, b) =>
				a.courseName.localeCompare(b.courseName),
			);
		} catch (error) {
			console.error("Get user courses error:", error);
			throw error;
		}
	});

export const getPremiumCoursesAction = actionClient
	.schema(
		z.object({
			search: z.string().optional(),
			courseId: z.string().optional(),
			courseType: z.enum([CourseType.VIDEO, CourseType.EBOOK]).optional(),
			userId: z.string(),
		}),
	)
	.action(async ({ parsedInput }): Promise<{ data: PaginatedResult }> => {
		try {
			const { search, courseId, courseType, userId } = parsedInput;

			// Akses user sekarang granular per detail course.
			const userAccesses = await prisma.userCourseDetails.findMany({
				where: {
					userId,
					courseDetail: {
						course: {
							accessType: "PREMIUM",
						},
					},
				},
				select: {
					courseDetailId: true,
				},
			});

			const userCourseDetailIds = userAccesses.map((ua) => ua.courseDetailId);

			const where = {
				AND: [
					search
						? {
							OR: [
								{
									title: {
										contains: search,
									},
								},
								{
									course: {
										courseName: {
											contains: search,
										},
									},
								},
							],
						}
						: {},
					courseId
						? {
							courseId,
						}
						: {},
					courseType
						? {
							courseType,
						}
						: {},
					{
						id: {
							in: userCourseDetailIds,
						},
					},
					{
						course: {
							accessType: "PREMIUM" as const,
						},
					},
				],
			};

			const [courses, total] = await Promise.all([
				prisma.courseDetails.findMany({
					where,
					orderBy: [
						{
							createdAt: "desc",
						},
					],
					include: {
						course: {
							select: {
								id: true,
								courseName: true,
								price: true,
								linkPayment: true,
							},
						},
					},
				}),
				prisma.courseDetails.count({ where }),
			]);

			const result: PaginatedResult = {
				data: courses,
				total,
				pageCount: 1,
			};

			return { data: result };
		} catch (error) {
			console.error("Get premium courses error:", error);
			throw error;
		}
	});

export const getPremiumCourseById = async (courseId: string) => {
	try {
		const course = await prisma.courseDetails.findUnique({
			where: {
				id: courseId,
			},
			include: {
				course: {
					select: {
						id: true,
						courseName: true,
						price: true,
						linkPayment: true,
					},
				},
			},
		});

		return course;
	} catch (error) {
		console.error("Error getting premium course:", error);
		return null;
	}
};

export const getAllAvailableCoursesAction = actionClient
	.schema(
		z.object({
			userId: z.string(),
		}),
	)
	.action(async ({ parsedInput }) => {
		try {
			const { userId } = parsedInput;

			// Detail courses yang user punya aksesnya (granular per rekaman)
			const userAccesses = await prisma.userCourseDetails.findMany({
				where: {
					userId,
				},
				select: {
					courseDetailId: true,
				},
			});

			const subscribedDetailIds = userAccesses.map((ua) => ua.courseDetailId);

			const allCourses = await prisma.courses.findMany({
				where: {
					accessType: "PREMIUM",
				},
				select: {
					id: true,
					courseName: true,
					price: true,
					linkPayment: true,
					CourseDetails: {
						select: {
							id: true,
							title: true,
							description: true,
							courseType: true,
						},
					},
				},
				orderBy: {
					CourseDetails: {
						_count: "desc",
					},
				},
			});

			return {
				subscribedDetailIds,
				allCourses: allCourses.map((course) => ({
					...course,
					courseDetails: course.CourseDetails,
				})),
			};
		} catch (error) {
			console.error("Error getting all available courses:", error);
			throw error;
		}
	});
