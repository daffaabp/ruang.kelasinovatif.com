import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import type { SessionData } from "@/lib/sessions";
import { Sidebar } from "./sidebar";

export async function SidebarWrapper() {
	const session = await getSession();

	// Fetch profile directly from database to ensure fresh data
	const profile = await prisma.userProfile.findFirst({
		where: {
			userId: session.userId,
		},
	});

	// Create a plain object from session with only the necessary data
	const sessionData: SessionData = {
		userId: session.userId || undefined,
		email: session.email || undefined,
		isAdmin: session.isAdmin || false,
		// use fetched profile
		profile: profile
			? {
				firstName: profile.firstName,
				lastName: profile.lastName,
				phone: profile.phone,
				institution: profile.institution,
				address: profile.address,
				city: profile.city,
				province: profile.province,
			}
			: null,
	};

	// Convert to plain object using JSON
	const plainSessionData = JSON.parse(JSON.stringify(sessionData));

	return <Sidebar session={plainSessionData} />;
}
