import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import type { Metadata } from "next";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
	title: "Profile",
	description: "Update your profile information",
};

export default async function ProfilePage() {
	const session = await getSession();

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

	return (
		<div className="space-y-3">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">
						Pengaturan Profil
					</h1>
					<p className="text-sm text-muted-foreground">
						Lengkapi informasi profil Anda untuk mengakses semua fitur
					</p>
				</div>
			</div>

			{/* Form Section */}
			<div className="bg-background">
				<ProfileForm initialData={profile} />
			</div>
		</div>
	);
}
