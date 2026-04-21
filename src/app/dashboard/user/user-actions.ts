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
			roleFilter: z.enum(["all", "admin", "member"]).optional(),
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
				roleFilter = "all",
				sortField = "createdAt",
				sortOrder = "desc",
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
								{ email: { contains: term } },
								{
									UserProfile: {
										some: {
											OR: [
												{ firstName: { contains: term } },
												{ lastName: { contains: term } },
												{ institution: { contains: term } },
												{ city: { contains: term } },
												{ province: { contains: term } },
												{ address: { contains: term } },
												{ phone: { contains: term } },
											],
										},
									},
								},
							],
						})),
					}
				: {};
			const roleWhere =
				roleFilter === "admin"
					? {
							tokens: {
								some: { type: "EMAIL_VERIFICATION" as const },
							},
						}
					: roleFilter === "member"
						? {
								tokens: {
									none: { type: "EMAIL_VERIFICATION" as const },
								},
							}
						: {};
			const whereClauses = [searchWhere, roleWhere].filter(
				(clause) => Object.keys(clause).length > 0,
			);
			const where = whereClauses.length > 0 ? { AND: whereClauses } : {};

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
						UserCourseDetails: {
							select: {
								id: true,
								courseDetailId: true,
								courseDetail: {
									select: {
										id: true,
										title: true,
										course: {
											select: {
												id: true,
												courseName: true,
												accessType: true,
											},
										},
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
					UserCourseDetails: user.UserCourseDetails,
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
					...(parsedInput.courseDetails && parsedInput.courseDetails.length > 0
						? {
								UserCourseDetails: {
									create: parsedInput.courseDetails.map((courseDetailId) => ({
										courseDetailId,
									})),
								},
							}
						: {}),
				},
				include: {
					UserProfile: true,
					UserCourseDetails: {
						select: {
							id: true,
							courseDetailId: true,
							courseDetail: {
								select: {
									id: true,
									title: true,
									course: {
										select: {
											id: true,
											courseName: true,
											accessType: true,
										},
									},
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
			const user = await prisma.user.findUnique({
				where: { id: parsedInput.id },
				include: {
					UserCourseDetails: true,
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

			if (user.UserCourseDetails.length > 0) {
				return {
					data: null,
					error: {
						serverError: `User masih memiliki ${user.UserCourseDetails.length} akses rekaman aktif. Hapus semua akses rekaman terlebih dahulu.`,
						type: "HAS_ACTIVE_COURSES",
						courseCount: user.UserCourseDetails.length,
					},
				};
			}

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

			type UpdateData = {
				email: string;
				UserProfile?: {
					update: {
						where: { id: string };
						data: Record<string, string>;
					};
				};
				UserCourseDetails?: {
					deleteMany: Record<string, never>;
					create: Array<{
						courseDetailId: string;
					}>;
				};
			};

			const updateData: UpdateData = {
				email: parsedInput.email,
			};

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

			if (parsedInput.courseDetails) {
				updateData.UserCourseDetails = {
					deleteMany: {},
					create: parsedInput.courseDetails.map((courseDetailId) => ({
						courseDetailId,
					})),
				};
			}

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
