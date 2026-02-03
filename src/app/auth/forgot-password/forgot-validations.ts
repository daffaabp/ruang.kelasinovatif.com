import { z } from "zod";

export const forgotSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

export type ForgotSchema = z.infer<typeof forgotSchema>;

export const forgotResponseSchema = z.object({
	message: z.string(),
	success: z.boolean(),
});
