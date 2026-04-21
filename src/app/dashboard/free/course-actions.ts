"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { CourseType } from "@prisma/client";
import { z } from "zod";
import type { PaginatedResult } from "./course-types";

export const getFreeCoursesAction = actionClient
	.schema(
		z.object({
			courseType: z.nativeEnum(CourseType).optional(),
		}),
	)
	.action(async ({ parsedInput }): Promise<PaginatedResult> => {
		try {
			const { courseType } = parsedInput;

			const where = {
				AND: [
					courseType ? { courseType } : {},
					{
						course: {
							accessType: "FREE" as const,
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
								courseName: true,
							},
						},
					},
				}),
				prisma.courseDetails.count({ where }),
			]);

			const result: PaginatedResult = {
				data: courses,
				total,
				pageCount: 1, // Since we're not using pagination
			};

			return result;
		} catch (error) {
			console.error("Get free courses error:", error);
			throw error;
		}
	});

export const getFreeCourseById = async (courseId: string) => {
	try {
		const course = await prisma.courseDetails.findUnique({
			where: {
				id: courseId,
				course: {
					accessType: "FREE",
				},
			},
			include: {
				course: {
					select: {
						id: true,
						courseName: true,
					},
				},
			},
		});

		return course;
	} catch (error) {
		console.error("Error getting free course:", error);
		return null;
	}
};
