import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { Header } from "./header";

export async function HeaderWrapper() {
	const session = await getSession();

	// Get user profile data
	const profile = await prisma.userProfile.findFirst({
		where: {
			userId: session.userId,
		},
		select: {
			firstName: true,
			lastName: true,
		},
	});

	return (
		<Header
			firstName={profile?.firstName}
			lastName={profile?.lastName}
			email={session.email}
			isAdmin={session.isAdmin || false}
		/>
	);
}
