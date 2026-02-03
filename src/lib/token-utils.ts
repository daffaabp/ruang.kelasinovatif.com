import { customAlphabet } from "nanoid";
import { prisma } from "./prisma";
import { TokenType } from "@prisma/client";

// Use URL-safe characters: A-Z, a-z, 0-9, _ (underscore), - (hyphen)
const alphabet =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const nanoid = customAlphabet(alphabet, 32);

export function generateToken() {
	return nanoid();
}

export function getTokenExpiration(hours = 24) {
	return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function validatePasswordResetToken(token: string, email: string) {
	// Find the token with its associated user
	const userToken = await prisma.userToken.findFirst({
		where: {
			token,
			type: TokenType.PASSWORD_RESET,
			expiresAt: {
				gt: new Date(),
			},
			user: {
				email,
			},
		},
		include: {
			user: true,
		},
	});

	if (!userToken) {
		return null;
	}

	return userToken;
}

export async function createPasswordResetToken(userId: string) {
	const token = generateToken();
	const expiresAt = getTokenExpiration(24); // 24 hours

	// Delete any existing reset tokens for this user
	await prisma.userToken.deleteMany({
		where: {
			userId,
			type: TokenType.PASSWORD_RESET,
		},
	});

	// Create new reset token
	const userToken = await prisma.userToken.create({
		data: {
			token,
			expiresAt,
			type: TokenType.PASSWORD_RESET,
			userId,
		},
		include: {
			user: true,
		},
	});

	return userToken;
}
