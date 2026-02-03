"use server";

import { actionClient } from "@/lib/safe-action";
import { resetSchema } from "./reset-validations";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password-utils";
import { validatePasswordResetToken } from "@/lib/token-utils";

export const resetAction = actionClient
	.schema(resetSchema)
	.action(async ({ parsedInput }) => {
		return await prisma.$transaction(async (tx) => {
			// Validate token
			const validToken = await validatePasswordResetToken(
				parsedInput.token,
				parsedInput.email,
			);

			if (!validToken) {
				returnValidationErrors(resetSchema, {
					_errors: ["Invalid or expired reset link"],
				});
			}

			// Hash the new password
			const hashedPassword = await hashPassword(parsedInput.password);

			// Update user password
			await tx.user.update({
				where: { id: validToken.userId },
				data: { hashedPassword },
			});

			// Delete the used token
			await tx.userToken.delete({
				where: { id: validToken.id },
			});

			// Return success
			return {
				success: true,
				message: "Password reset successful",
			};
		});
	});
