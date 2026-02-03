import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
