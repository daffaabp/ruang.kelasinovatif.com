import { hash, compare } from "bcrypt-ts";
import { randomBytes } from "node:crypto";

// Increase salt rounds for better security
const saltRounds = 12;

// Add pepper to add an additional layer of security
const PEPPER = process.env.PASSWORD_PEPPER || randomBytes(32).toString("hex");

export const hashPassword = async (password: string) => {
	// Add pepper before hashing
	const pepperedPassword = password + PEPPER;
	return await hash(pepperedPassword, saltRounds);
};

export const verifyPassword = async (
	password: string,
	hashedPassword: string,
) => {
	// Add pepper before comparing
	const pepperedPassword = password + PEPPER;
	return await compare(pepperedPassword, hashedPassword);
};
