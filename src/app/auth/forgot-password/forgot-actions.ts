"use server";

import * as React from "react";
import { actionClient } from "@/lib/safe-action";
import { forgotSchema } from "./forgot-validations";
import { returnValidationErrors } from "next-safe-action";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/token-utils";
import { Resend } from "resend";
import { EmailTemplate } from "./email-template";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const forgotAction = actionClient
	.schema(forgotSchema)
	.action(async ({ parsedInput }) => {
		// Look up user by provided email
		const user = await prisma.user.findUnique({
			where: {
				email: parsedInput.email,
			},
		});

		// Return validation error if email not found
		if (!user) {
			returnValidationErrors(forgotSchema, {
				_errors: ["Email not found"],
			});
		}

		// Create reset token
		const userToken = await createPasswordResetToken(user.id);

		// Generate reset link using APP_URL from environment
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const resetLink = `${baseUrl}/auth/reset-password?token=${userToken.token}&email=${user.email}`;

		// Send email with reset link
		const { error } = await resend.emails.send({
			from: "KelasInovatif <noreply@email.bakatkreatif.com>", // dont edit
			to: user.email,
			subject: "Reset Your Password",
			react: React.createElement(EmailTemplate, {
				resetLink,
			}),
		});

		if (error) {
			returnValidationErrors(forgotSchema, {
				_errors: ["Failed to send reset email"],
			});
		}

		// Return success response
		return {
			success: true,
			message: "Password reset email sent",
		};
	});
