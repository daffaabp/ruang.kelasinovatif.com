"use client";

import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SessionData } from "@/lib/sessions";
import { cn } from "@/lib/utils";
import {
	Book,
	BookOpen,
	GraduationCap,
	Home,
	Menu,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

// Menu item yang selalu muncul (common)
const commonMenuItems: MenuItem[] = [
	{
		title: "Beranda",
		href: "/dashboard",
		icon: Home,
	},
];

// Menu khusus admin
const adminOnlyMenuItems: MenuItem[] = [
	{
		title: "Courses",
		href: "/dashboard/courses",
		icon: Book,
	},
	{
		title: "Detail Courses",
		href: "/dashboard/detailcourse",
		icon: BookOpen,
	},
	{
		title: "Users",
		href: "/dashboard/user",
		icon: Users,
	},
];

// Menu khusus user biasa
const userOnlyMenuItems: MenuItem[] = [
	{
		title: "Materi Gratis",
		href: "/dashboard/free",
		icon: GraduationCap,
	},
	{
		title: "Materi Premium",
		href: "/dashboard/premium",
		icon: GraduationCap,
	},
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	session: SessionData;
}

export function Sidebar({ className, session }: SidebarProps) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	// Gabungkan menu sesuai role
	const menuItems = session?.isAdmin
		? [...commonMenuItems, ...adminOnlyMenuItems]
		: [...commonMenuItems, ...userOnlyMenuItems];

	return (
		<>
			{/* Mobile Menu Button */}
			<Button
				variant="ghost"
				size="icon"
				className="md:hidden fixed top-4 left-4 z-50"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</Button>

			{/* Sidebar */}
			<div
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-white border-r border-white/10 shadow-xl transition-all duration-300 ease-in-out w-64",
					"md:translate-x-0",
					!isOpen && "-translate-x-full md:translate-x-0",
					className,
				)}
			>
				{/* Logo and Header */}
				<div className="border-b border-white/10 h-16 px-6 flex items-center bg-black/10">
					<div className="flex items-center gap-2">
						{/* Fallback specific logo or icon if image fails or for design match */}
						<span className="material-icons-round text-primary text-3xl">
							school
						</span>
						<span className="text-white text-xl font-bold tracking-tight">
							KelasInovatif
						</span>
					</div>
				</div>

				{/* Menu */}
				<ScrollArea className="flex-1 px-4 py-6">
					<nav className="space-y-1">
						{menuItems.map((item) => (
							<Link key={item.href} href={item.href}>
								<Button
									variant="ghost"
									className={cn(
										"w-full justify-start gap-3 px-4 py-3 h-auto rounded-lg transition-colors group",
										pathname === item.href
											? "bg-primary/20 text-white border-l-4 border-primary shadow-sm"
											: "text-slate-300 hover:bg-white/10 hover:text-white",
									)}
								>
									<item.icon
										className={cn(
											"h-5 w-5 shrink-0 transition-colors",
											pathname === item.href
												? "text-primary"
												: "text-slate-400 group-hover:text-primary",
										)}
									/>
									<span className="font-medium truncate">{item.title}</span>
								</Button>
							</Link>
						))}

						<div className="pt-6 pb-2">
							<p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
								Pengaturan
							</p>
						</div>

						{/* Hardcoded Settings Links from Reference for Visual Match (can be made dynamic later) */}
						<Link href="/dashboard/profile">
							<Button
								variant="ghost"
								className={cn(
									"w-full justify-start gap-3 px-4 py-3 h-auto rounded-lg transition-colors group",
									pathname.includes("/dashboard/profile")
										? "bg-primary/20 text-white border-l-4 border-primary shadow-sm"
										: "text-slate-300 hover:bg-white/10 hover:text-white",
								)}
							>
								<span
									className={cn(
										"material-icons-round text-[20px] shrink-0 transition-colors",
										pathname.includes("/dashboard/profile")
											? "text-primary"
											: "text-slate-400 group-hover:text-primary",
									)}
								>
									person
								</span>
								<span className="font-medium truncate">Profil</span>
							</Button>
						</Link>
					</nav>
				</ScrollArea>

				{/* Footer / User Info from Reference */}
				<div className="p-4 border-t border-white/10 bg-black/20">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
							{session?.profile?.firstName
								? session.profile.firstName.substring(0, 1).toUpperCase() +
								(session.profile.lastName
									? session.profile.lastName.substring(0, 1).toUpperCase()
									: "")
								: "US"}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-white truncate uppercase">
								{session?.profile?.firstName
									? `${session.profile.firstName} ${session.profile.lastName || ""}`
									: "User"}
							</p>
							<p className="text-xs text-slate-400 truncate">Siswa Premium</p>
						</div>
					</div>
					<button
						className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
						onClick={async () => {
							await logoutAction(); // Assuming logoutAction is imported or passed.
							// If sidebar is server component, this might need client logic. 
							// Sidebar is "use client" so we can import the action.
						}}
					>
						<span className="material-icons-round text-lg">logout</span>
						Keluar
					</button>
				</div>
			</div>

			{/* Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 md:hidden"
					onClick={() => setIsOpen(false)}
					onKeyDown={() => setIsOpen(false)}
					role="button"
					tabIndex={0}
				/>
			)}
		</>
	);
}
