import { HeaderWrapper } from "./components/header-wrapper";
import { SidebarWrapper } from "./components/sidebar-wrapper";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen bg-gray-50">
			{/* Sidebar */}
			<SidebarWrapper />

			{/* Main Content */}
			<div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out md:pl-16 lg:pl-64">
				{/* Header */}
				<HeaderWrapper />

				{/* Main Content Area */}
				<main className="flex-1">
					<div className="mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-6">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
