"use client";

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
import Image from "next/image";
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
					"fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r shadow-sm transition-all duration-300 ease-in-out w-64",
					"md:translate-x-0",
					!isOpen && "-translate-x-full md:translate-x-0",
					className,
				)}
			>
				{/* Logo and Header */}
				<div className="border-b h-16 px-4 flex items-center">
					<div className="flex items-center justify-center w-full transition-all duration-300 ease-in-out">
						<div className="relative w-40 h-12">
							<Image
								src="/images/kelasinovatif-clean.png"
								alt="Kelas Inovatif Logo"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</div>
				</div>

				{/* Menu */}
				<ScrollArea className="flex-1">
					<nav className="space-y-1 p-2">
						{menuItems.map((item) => (
							<Link key={item.href} href={item.href}>
								<Button
									variant={pathname === item.href ? "secondary" : "ghost"}
									className={cn(
										"w-full justify-start gap-4 px-3 py-2 h-11 hover:bg-secondary/80",
										pathname === item.href && "bg-secondary font-medium",
									)}
								>
									<item.icon className="h-5 w-5 shrink-0" />
									<span className="truncate">{item.title}</span>
								</Button>
							</Link>
						))}
					</nav>
				</ScrollArea>

				{/* Alumni Group Badge */}
				{/* {!session?.isAdmin && (
					<div className="px-4 py-3">
						<div className="rounded-lg border border-primary/20 p-3 space-y-2">
							<div className="flex items-center gap-2 text-primary">
								<UserPlus className="h-5 w-5" />
								<span className="font-medium text-sm">Komunitas Alumni</span>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Bergabung dengan komunitas alumni untuk diskusi dan berbagi
								pengalaman
							</p>
							<a
								href="https://chat.whatsapp.com/G0p3B50Fbgk4rcTcMxeOd0"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-md py-1.5 text-sm font-medium transition-colors"
							>
								<MessageCircle className="h-4 w-4" />
								Gabung Grup WhatsApp
							</a>
						</div>
					</div>
				)} */}

				{/* Footer */}
				<div className="border-t p-4 space-y-2">
					<p className="text-xs text-muted-foreground text-center leading-tight">
						Platform Pembelajaran AI Pertama di Indonesia
					</p>
					<p className="text-xs text-muted-foreground text-center">
						© 2025 Kelas Inovatif
					</p>
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
