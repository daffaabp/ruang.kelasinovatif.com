"use server";

import { actionClient } from "@/lib/safe-action";
import { registerResponseSchema, registerSchema } from "./register-validations";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password-utils";
import { getSession } from "@/lib/sessions";

export const registerAction = actionClient
	.schema(registerSchema)
	.outputSchema(registerResponseSchema)
	.action(async ({ parsedInput }) => {
		return await prisma.$transaction(async (tx) => {
			// Check if user with email already exists
			const user = await tx.user.findUnique({
				where: {
					email: parsedInput.email,
				},
			});

			// Return error if email is already registered
			if (user) {
				returnValidationErrors(registerSchema, {
					_errors: ["Email already exists"],
				});
			}

			// Hash the user's password before storing
			const hashedPassword = await hashPassword(parsedInput.password);

			// Create new user record in database
			const newUser = await tx.user.create({
				data: {
					email: parsedInput.email,
					hashedPassword,
				},
			});

			// Create and save user session
			const session = await getSession();
			session.email = newUser.email;
			session.userId = newUser.id;
			await session.save();

			// Return success response and redirect
			return {
				success: true,
				message: "Registration successful",
			};
		});
	});
