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
					NOT: {
						price: null,
					},
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

export const getUserCoursesAction = actionClient
	.schema(
		z.object({
			userId: z.string(),
		}),
	)
	.action(async ({ parsedInput }): Promise<CourseOption[]> => {
		try {
			const { userId } = parsedInput;

			const userCourses = await prisma.userCourses.findMany({
				where: {
					userId: userId,
					course: {
						NOT: {
							price: null,
						},
					},
				},
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
				orderBy: {
					course: {
						courseName: "asc",
					},
				},
			});

			return userCourses.map((uc) => uc.course);
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

			// Get user's courses
			const userCourses = await prisma.userCourses.findMany({
				where: {
					userId: userId,
					course: {
						NOT: {
							price: null,
						},
					},
				},
				select: {
					courseId: true,
				},
			});

			const userCourseIds = userCourses.map((uc) => uc.courseId);

			const where = {
				AND: [
					search
						? {
							OR: [
								{
									title: {
										contains: search
									},
								},
								{
									course: {
										courseName: {
											contains: search
										},
									},
								},
							],
						}
						: {},
					courseId
						? {
							courseId: courseId,
						}
						: {},
					courseType
						? {
							courseType: courseType,
						}
						: {},
					{
						courseId: {
							in: userCourseIds,
						},
					},
					{
						course: {
							NOT: {
								price: null,
							},
						},
					},
				],
			};

			const [courses, total] = await Promise.all([
				prisma.courseDetails.findMany({
					where,
					orderBy: [
						{
							createdAt: "desc"
						}
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
				pageCount: 1, // Since we're not using pagination in the premium version
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

			// Get user's subscribed courses
			const userCourses = await prisma.userCourses.findMany({
				where: {
					userId: userId,
				},
				select: {
					courseId: true,
				},
			});

			const subscribedCourseIds = userCourses.map((uc) => uc.courseId);

			// Get all available courses with their details
			const allCourses = await prisma.courses.findMany({
				where: {
					NOT: {
						price: null,
					},
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
						_count: "desc"
					}
				},
			});

			return {
				subscribedCourses: subscribedCourseIds,
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
