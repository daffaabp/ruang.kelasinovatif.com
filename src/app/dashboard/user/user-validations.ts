import { z } from "zod";

export const userProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phone: z.string().min(10, "Phone number must be at least 10 characters"),
	institution: z.string().min(1, "Institution is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	province: z.string().min(1, "Province is required"),
});

export const createUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	profile: userProfileSchema,
	courses: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
	id: z.string().min(1, "User ID is required"),
	email: z.string().email("Invalid email address"),
	profile: z.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		phone: z.string().optional(),
		institution: z.string().optional(),
		address: z.string().optional(),
		city: z.string().optional(),
		province: z.string().optional(),
	}).optional(),
	courses: z.array(z.string()).optional(),
});

export const deleteUserSchema = z.object({
	id: z.string().min(1, "User ID is required"),
});

export type UserProfileValues = z.infer<typeof userProfileSchema>;
export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
export type DeleteUserValues = z.infer<typeof deleteUserSchema>;
