import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SidebarWrapper } from "./components/sidebar-wrapper"
import { HeaderWrapper } from "./components/header-wrapper"

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
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
		</SidebarProvider>
	)
}
