import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SidebarWrapper } from "./components/sidebar-wrapper"
import { HeaderWrapper } from "./components/header-wrapper"
import { ProfileCompletionDialog } from "./components/profile-completion-dialog"
import { getSession } from "@/lib/sessions"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const session = await getSession()
	const profile = session.userId
		? await prisma.userProfile.findFirst({
				where: { userId: session.userId },
				select: { id: true },
			})
		: null

	const hasProfile = !!profile

	return (
		<SidebarProvider>
			<SidebarWrapper />
			<SidebarInset>
				<HeaderWrapper />
				<main className="flex flex-1 flex-col">
					<div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
						{children}
					</div>
				</main>
			</SidebarInset>
			{!hasProfile && <ProfileCompletionDialog />}
		</SidebarProvider>
	)
}
