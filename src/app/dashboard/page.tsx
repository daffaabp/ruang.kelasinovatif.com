import { Container } from "@/components/shared/container";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { QuickAccessCard } from "./components/quick-access-card";
import { ProfileCard } from "./profile-card";

export default async function DashboardPage() {
	const session = await getSession();

	// Get user profile data
	const profile = await prisma.userProfile.findFirst({
		where: {
			userId: session.userId,
		},
		select: {
			firstName: true,
			lastName: true,
			phone: true,
			institution: true,
			address: true,
			city: true,
			province: true,
		},
	});

	// Prepare session data
	const sessionData = {
		userId: session.userId,
		email: session.email,
		isAdmin: session.isAdmin,
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
			: null
	};

	// Log session data
	console.log("Session Data:", sessionData);

	return (
		<Container variant="default">
			<div className="space-y-6">
				{/* Welcome Section */}
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Selamat datang, {profile?.firstName} {profile?.lastName}
					</h1>
					<p className="text-muted-foreground">
						Selamat datang di AIK Membership.
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Profile Card */}
					<ProfileCard session={sessionData} />

					{/* Quick Access */}
					<div className="space-y-4">
						<div>
							<h2 className="text-lg font-semibold">Akses Cepat</h2>
							<p className="text-sm text-muted-foreground">
								Akses cepat ke materi pembelajaran
							</p>
						</div>
						<div className="grid gap-4">
							<QuickAccessCard />
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
}
