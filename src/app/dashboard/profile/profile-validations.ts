import { z } from "zod";

export const profileSchema = z.object({
	firstName: z.string().min(1, { message: "Nama depan wajib diisi" }),
	lastName: z.string().min(1, { message: "Nama belakang wajib diisi" }),
	phone: z.string().min(1, { message: "No. telepon wajib diisi" }),
	institution: z.string().min(1, { message: "Institusi / sekolah wajib diisi" }),
	address: z.string().min(1, { message: "Alamat wajib diisi" }),
	city: z.string().min(1, { message: "Kota wajib diisi" }),
	province: z.string().min(1, { message: "Provinsi wajib diisi" }),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const profileResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});
