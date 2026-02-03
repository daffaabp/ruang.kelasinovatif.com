import { z } from "zod";

export const profileSchema = z.object({
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	phone: z.string().nullable(),
	institution: z.string().nullable(),
	address: z.string().nullable(),
	city: z.string().nullable(),
	province: z.string().nullable(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const profileResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
