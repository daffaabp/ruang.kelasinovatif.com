import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email({ message: "Alamat email tidak valid" }),
	password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
