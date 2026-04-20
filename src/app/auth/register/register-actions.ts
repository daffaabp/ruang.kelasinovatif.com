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
			const existingUser = await tx.user.findUnique({
				where: { email: parsedInput.email },
			});

			if (existingUser) {
				returnValidationErrors(registerSchema, {
					_errors: ["Email sudah terdaftar"],
				});
			}

			const hashedPassword = await hashPassword(parsedInput.password);

			const newUser = await tx.user.create({
				data: {
					email: parsedInput.email,
					hashedPassword,
				},
			});

			const session = await getSession();
			session.email = newUser.email;
			session.userId = newUser.id;
			await session.save();

			return {
				success: true,
				message: "Pendaftaran berhasil",
			};
		});
	});
