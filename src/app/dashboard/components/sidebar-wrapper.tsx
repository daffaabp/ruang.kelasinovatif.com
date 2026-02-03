import { getSession } from "@/lib/sessions";
import type { SessionData } from "@/lib/sessions";
import { Sidebar } from "./sidebar";

export async function SidebarWrapper() {
	const session = await getSession();

	// Create a plain object from session with only the necessary data
	const sessionData: SessionData = {
		userId: session.userId || undefined,
		email: session.email || undefined,
		isAdmin: session.isAdmin || false,
		// Create a new plain object for profile if it exists
		profile: session.profile
			? {
					firstName: session.profile.firstName,
					lastName: session.profile.lastName,
					phone: session.profile.phone,
					institution: session.profile.institution,
					address: session.profile.address,
					city: session.profile.city,
					province: session.profile.province,
				}
			: null,
	};

	// Convert to plain object using JSON
	const plainSessionData = JSON.parse(JSON.stringify(sessionData));

	return <Sidebar session={plainSessionData} />;
}
