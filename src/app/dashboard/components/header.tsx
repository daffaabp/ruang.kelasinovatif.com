"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const titleMap: Record<string, string> = {
	"/dashboard": "Beranda",
	"/dashboard/profile": "Pengaturan Akun",
	"/dashboard/courses": "Courses",
	"/dashboard/detailcourse": "Detail Courses",
	"/dashboard/user": "Users",
	"/dashboard/free": "Materi Gratis",
	"/dashboard/premium": "Materi Premium",
}

export function Header() {
	const pathname = usePathname()

	let title = "Dashboard"

	if (titleMap[pathname]) {
		title = titleMap[pathname]
	} else {
		const matchingPath = Object.keys(titleMap).find(
			(path) => path !== "/dashboard" && pathname.startsWith(path)
		)
		if (matchingPath) {
			title = titleMap[matchingPath]
		}
	}

	return (
		<header className="glass-header sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-black/5 px-4 transition-[width,height] ease-linear">
			<div className="flex w-full items-center gap-3">
				{/* Sidebar toggle trigger dari shadcn */}
				<SidebarTrigger className="-ml-1 text-slate-600 hover:text-primary" />
				<Separator orientation="vertical" className="mr-1 h-5" />
				<h1 className="text-xl font-bold text-slate-800">{title}</h1>
			</div>
		</header>
	)
}
