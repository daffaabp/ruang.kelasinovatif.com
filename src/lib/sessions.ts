import type { SessionOptions } from "iron-session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
	userId?: string;
	email?: string;
	isAdmin?: boolean;
	profile?: {
		firstName: string | null;
		lastName: string | null;
		phone: string | null;
		institution: string | null;
		address: string | null;
		city: string | null;
		province: string | null;
	} | null;
}

export const defaultSession: SessionData = {
	userId: undefined,
	email: undefined,
	isAdmin: false,
	profile: null,
};

if (!process.env.IRON_SESSION_SECRET) {
	throw new Error("IRON_SESSION_SECRET is not set");
}

if (!process.env.IRON_SESSION_COOKIE_NAME) {
	throw new Error("IRON_SESSION_COOKIE_NAME is not set");
}

export const sessionOptions: SessionOptions = {
	password: process.env.IRON_SESSION_SECRET,
	cookieName: process.env.IRON_SESSION_COOKIE_NAME,
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	},
};

export async function getSession() {
	const cookieStore = await cookies();
	const session = await getIronSession<SessionData>(
		cookieStore,
		sessionOptions,
	);

	if (!session.userId) {
		session.userId = defaultSession.userId;
		session.email = defaultSession.email;
		session.profile = defaultSession.profile;
	}

	return session;
}
