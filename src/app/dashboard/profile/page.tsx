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
		<div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
			<div className="mb-8">
				<nav className="flex text-sm text-slate-500 mb-2">
					<a className="hover:text-primary transition-colors" href="/dashboard">
						Home
					</a>
					<span className="mx-2">/</span>
					<span className="text-slate-800 font-medium">Profil</span>
				</nav>
				<h2 className="text-3xl font-bold text-slate-800 tracking-tight">
					Edit Profil
				</h2>
				<p className="text-slate-500 mt-1">
					Kelola informasi pribadi dan preferensi akun Anda.
				</p>
			</div>

			<ProfileForm initialData={profile} />

			<footer className="text-center text-sm text-slate-400 py-6">
				<p>© 2025 Kelas Inovatif. All rights reserved.</p>
				<p className="text-xs mt-1">
					Platform Pembelajaran AI Pertama di Indonesia
				</p>
			</footer>
		</div>
	);
}
