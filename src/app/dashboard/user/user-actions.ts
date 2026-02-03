"use server";

import { hashPassword } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PaginatedResult } from "./user-types";
import { createUserSchema, updateUserSchema } from "./user-validations";

export const getUsersAction = actionClient
	.schema(
		z.object({
			page: z.number().min(1).default(1),
			perPage: z.number().min(1).default(10),
			search: z.string().optional(),
			sortField: z.enum(["email", "name", "createdAt"]).optional(),
			sortOrder: z.enum(["asc", "desc"]).optional(),
		}),
	)
	.action(async ({ parsedInput }): Promise<PaginatedResult> => {
		try {
			const {
				page,
				perPage,
				search,
				sortField = "createdAt",
				sortOrder = "desc",
			} = parsedInput;
			const skip = (page - 1) * perPage;

			const where = search
				? {
						OR: [
							{ email: { contains: search } },
							{
								UserProfile: {
									some: {
										OR: [
											{ firstName: { contains: search } },
											{ lastName: { contains: search } },
										],
									},
								},
							},
						],
					}
				: {};

			const orderBy = {
				[sortField]: sortOrder,
			};

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					where,
					skip,
					take: perPage,
					orderBy,
					include: {
						UserProfile: {
							select: {
								firstName: true,
								lastName: true,
								phone: true,
								institution: true,
								address: true,
								city: true,
								province: true,
							},
						},
						UserCourses: {
							select: {
								id: true,
								courseId: true,
								course: {
									select: {
										id: true,
										courseName: true,
									},
								},
							},
						},
						tokens: {
							where: {
								type: "EMAIL_VERIFICATION",
							},
							select: {
								id: true,
							},
						},
					},
				}),
				prisma.user.count({ where }),
			]);

			return {
				data: users.map((user) => ({
					id: user.id,
					email: user.email,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
					isAdmin: user.tokens.length > 0,
					UserProfile: user.UserProfile[0] || null,
					UserCourses: user.UserCourses,
				})),
				total,
				pageCount: Math.ceil(total / perPage),
			};
		} catch (error) {
			console.error("Get users error:", error);
			throw error;
		}
	});

export const createUserAction = actionClient
	.schema(createUserSchema)
	.action(async ({ parsedInput }) => {
		try {
			const hashedPassword = await hashPassword(parsedInput.password);

			const newUser = await prisma.user.create({
				data: {
					email: parsedInput.email,
					hashedPassword,
					UserProfile: {
						create: parsedInput.profile,
					},
					...(parsedInput.courses && parsedInput.courses.length > 0
						? {
								UserCourses: {
									create: parsedInput.courses.map((courseId) => ({
										courseId,
									})),
								},
							}
						: {}),
				},
				include: {
					UserProfile: true,
					UserCourses: {
						select: {
							id: true,
							courseId: true,
							course: {
								select: {
									id: true,
									courseName: true,
								},
							},
						},
					},
				},
			});

			revalidatePath("/dashboard/user");
			return {
				success: true,
				data: {
					...newUser,
					UserProfile: newUser.UserProfile[0] || null,
				},
			};
		} catch (error) {
			console.error("Create user error:", error);

			if (error instanceof Error) {
				return { success: false, error: error.message };
			}

			return {
				success: false,
				error: "Failed to create user due to database error",
			};
		}
	});

export const deleteUserAction = actionClient
	.schema(z.object({ id: z.string() }))
	.action(async ({ parsedInput }) => {
		try {
			// 1. Check if user exists and has active courses
			const user = await prisma.user.findUnique({
				where: { id: parsedInput.id },
				include: {
					UserCourses: true,
					UserProfile: true,
				},
			});

			if (!user) {
				return {
					data: null,
					error: {
						serverError: "User tidak ditemukan",
						type: "NOT_FOUND",
					},
				};
			}

			// 2. Check if user is admin
			const userToken = await prisma.userToken.findFirst({
				where: {
					userId: user.id,
					type: "EMAIL_VERIFICATION",
				},
			});

			if (userToken) {
				return {
					data: null,
					error: {
						serverError: "Tidak dapat menghapus user admin",
						type: "IS_ADMIN",
					},
				};
			}

			// 3. Check if user has active courses
			if (user.UserCourses.length > 0) {
				return {
					data: null,
					error: {
						serverError: `User masih memiliki ${user.UserCourses.length} course aktif. Hapus semua course terlebih dahulu.`,
						type: "HAS_ACTIVE_COURSES",
						courseCount: user.UserCourses.length,
					},
				};
			}

			// 4. Safe to delete
			await prisma.user.delete({
				where: { id: parsedInput.id },
			});

			revalidatePath("/dashboard/user");
			return {
				data: {
					message: `User ${user.UserProfile[0]?.firstName || user.email} berhasil dihapus`,
					type: "SUCCESS",
				},
				error: null,
			};
		} catch (error) {
			console.error("Delete error:", error);
			return {
				data: null,
				error: {
					serverError: "Terjadi kesalahan saat menghapus user",
					type: "UNKNOWN_ERROR",
				},
			};
		}
	});

export const updateUserAction = actionClient
	.schema(updateUserSchema)
	.action(async ({ parsedInput }) => {
		try {
			const user = await prisma.user.findUnique({
				where: { id: parsedInput.id },
				include: { UserProfile: true },
			});

			if (!user) {
				return returnValidationErrors(updateUserSchema, {
					_errors: ["User not found"],
				});
			}

			// Define type for updateData
			type UpdateData = {
				email: string;
				UserProfile?: {
					update: {
						where: { id: string };
						data: Record<string, string>;
					};
				};
				UserCourses?: {
					deleteMany: Record<string, never>;
					create: Array<{
						courseId: string;
					}>;
				};
			};

			// Prepare update data with proper type
			const updateData: UpdateData = {
				email: parsedInput.email,
			};

			// Hanya update profile jika ada data profile yang dikirim
			if (parsedInput.profile && user.UserProfile[0]?.id) {
				updateData.UserProfile = {
					update: {
						where: { id: user.UserProfile[0].id },
						data: Object.fromEntries(
							Object.entries(parsedInput.profile).filter(
								(entry) => entry[1] !== undefined,
							),
						),
					},
				};
			}

			// Update courses jika ada perubahan
			if (parsedInput.courses) {
				updateData.UserCourses = {
					deleteMany: {},
					create: parsedInput.courses.map((courseId) => ({
						courseId,
					})),
				};
			}

			// Update user data
			await prisma.user.update({
				where: { id: parsedInput.id },
				data: updateData,
			});

			revalidatePath("/dashboard/user");
			return {
				message: "User updated successfully",
			};
		} catch (error) {
			console.error("Update error:", error);
			return returnValidationErrors(updateUserSchema, {
				_errors: ["Failed to update user"],
			});
		}
	});
