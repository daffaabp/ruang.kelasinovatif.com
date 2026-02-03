import { z } from "zod";

export const resetSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		token: z.string().min(1, "Reset token is required"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(100, "Password must be less than 100 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ResetSchema = z.infer<typeof resetSchema>;

export const resetResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
