import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
	message: z.string(),
	success: z.boolean(),
});
