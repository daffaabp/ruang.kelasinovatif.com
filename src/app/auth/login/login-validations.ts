import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email({ message: "Alamat email tidak valid" }),
	password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
	message: z.string(),
	success: z.boolean(),
});
