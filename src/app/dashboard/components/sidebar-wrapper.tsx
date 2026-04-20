import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/sessions"
import type { SessionData } from "@/lib/sessions"
import { AppSidebar } from "./app-sidebar"

export async function SidebarWrapper() {
	const session = await getSession()

	const profile = await prisma.userProfile.findFirst({
		where: { userId: session.userId },
	})

	const sessionData: SessionData = {
		userId: session.userId || undefined,
		email: session.email || undefined,
		isAdmin: session.isAdmin || false,
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
	}

	const plainSessionData = JSON.parse(JSON.stringify(sessionData))

	return <AppSidebar session={plainSessionData} />
}
