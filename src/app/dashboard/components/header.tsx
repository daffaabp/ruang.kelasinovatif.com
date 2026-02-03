"use client";

import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, LogOut, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";

interface HeaderProps {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	isAdmin?: boolean;
}

export function Header({ firstName, lastName, email, isAdmin }: HeaderProps) {
	const { execute, status } = useAction(logoutAction);

	return (
		<header className="sticky top-0 z-40 border-b bg-white shadow-sm">
			<div className="px-4 md:px-6 h-16 flex items-center justify-between">
				<div className="flex items-center gap-4">
					{/* Left side content - can be used for breadcrumbs later */}
				</div>

				{/* Right side - User Menu */}
				<div className="flex items-center gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-2 hover:bg-secondary text-sm relative group"
							>
								<User className="h-5 w-5" />
								<span>
									{firstName} {lastName}
									{isAdmin && (
										<span className="ml-1 text-xs text-primary">- Admin</span>
									)}
								</span>
								{/* Tambahkan chevron yang berputar saat dropdown terbuka */}
								<svg
									className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
									role="presentation"
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium">
										{firstName} {lastName}
									</p>
									<p className="text-xs text-muted-foreground">{email}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href="/dashboard/profile"
									className="flex items-center gap-2 cursor-pointer"
								>
									<User className="h-4 w-4" />
									<span>Profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-red-600 focus:text-red-600 focus:bg-red-100"
								disabled={status === "executing"}
								onSelect={(e) => {
									e.preventDefault();
									execute();
								}}
							>
								<div className="flex items-center gap-2 w-full">
									{status === "executing" ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<LogOut className="h-4 w-4" />
									)}
									<span>
										{status === "executing" ? "Logging out..." : "Logout"}
									</span>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
