"use server";

import { hashPassword, verifyPassword } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { getSession } from "@/lib/sessions";
import { Role } from "@prisma/client";
import { returnValidationErrors } from "next-safe-action";
import { loginSchema } from "./login-validations";

const ADMIN_EMAILS = ["khotiachmad@gmail.com", "zazakihra@gmail.com"];
const ADMIN_PASSWORD = "kelasinovatif";

export const loginAction = actionClient
	.schema(loginSchema)
	.action(async ({ parsedInput }) => {
		return await prisma.$transaction(async (tx) => {
			// Check if trying to login as admin
			const isAdminAttempt = ADMIN_EMAILS.includes(parsedInput.email);

			if (isAdminAttempt) {
				// If admin email but wrong password
				if (parsedInput.password !== ADMIN_PASSWORD) {
					returnValidationErrors(loginSchema, {
						_errors: ["Invalid email or password"],
					});
				}

				// Find or create admin user
				const hashedAdminPassword = await hashPassword(ADMIN_PASSWORD);
			const user = await tx.user.upsert({
				where: { email: parsedInput.email },
				create: {
					email: parsedInput.email,
					hashedPassword: hashedAdminPassword,
					role: Role.ADMIN,
				},
				update: { role: Role.ADMIN },
			});

				// Create and save admin session
				const session = await getSession();
				session.email = user.email;
				session.userId = user.id;
				session.isAdmin = true;
				await session.save();

				return {
					success: true,
					message: "Login successful",
				};
			}

			// Regular user login flow
			const user = await tx.user.findUnique({
				where: {
					email: parsedInput.email,
				},
			});

			// Return error if user not found
			if (!user) {
				returnValidationErrors(loginSchema, {
					_errors: ["Invalid email or password"],
				});
			}

			// Verify password matches
			const isValidPassword = await verifyPassword(
				parsedInput.password,
				user?.hashedPassword || "",
			);

			// Return error if password invalid
			if (!isValidPassword) {
				returnValidationErrors(loginSchema, {
					_errors: ["Invalid email or password"],
				});
			}

			// Create and save user session
			const session = await getSession();
			session.email = user.email;
			session.userId = user.id;
			session.isAdmin = false;
			await session.save();

			// Return success response
			return {
				success: true,
				message: "Login successful",
			};
		});
	});
