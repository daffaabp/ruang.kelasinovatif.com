"use client";

import { usePathname } from "next/navigation";

// Header no longer needs user props as it doesn't display them
export function Header() {
	const pathname = usePathname();

	const titleMap: { [key: string]: string } = {
		"/dashboard": "Beranda",
		"/dashboard/profile": "Pengaturan Akun",
		"/dashboard/courses": "Courses",
		"/dashboard/detailcourse": "Detail Courses",
		"/dashboard/user": "Users",
		"/dashboard/free": "Materi Gratis",
		"/dashboard/premium": "Materi Premium",
	};

	let title = "Pengaturan Akun"; // Default

	// Check exact match first
	if (titleMap[pathname]) {
		title = titleMap[pathname];
	} else {
		// Handle nested routes or partial matches if needed
		// For now simple exact mapping covers the sidebar items
		const matchingPath = Object.keys(titleMap).find(
			(path) => path !== "/dashboard" && pathname.startsWith(path)
		);
		if (matchingPath) {
			title = titleMap[matchingPath];
		}
	}


	return (
		<header className="glass-header sticky top-0 z-40 h-16 flex items-center justify-between px-8">
			<div className="md:px-0 h-16 flex items-center justify-between w-full">
				<div className="flex items-center gap-4">
					<h1 className="text-xl font-bold text-slate-800">{title}</h1>
				</div>

				{/* Right side - User Menu */}
				<div className="flex items-center gap-4">
					<button className="p-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors relative">
						<span className="material-icons-round">notifications</span>
						<span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
					</button>
					<div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm cursor-pointer hover:border-primary/30 transition-colors mr-2">
						<span className="material-icons-round text-slate-500 text-[20px]">
							search
						</span>
						<input
							className="bg-transparent border-none text-sm focus:outline-none w-32 placeholder-slate-400"
							placeholder="Cari..."
							type="text"
						/>
					</div>

				</div>

				{/* Notification & Search are now the only right-side items */}
			</div>
		</header>
	);
}
