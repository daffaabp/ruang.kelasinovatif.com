"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, CheckCheck, ShieldCheck, UserPlus, Video } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	getNotificationsAction,
	markNotificationsReadAction,
} from "./notification-actions";

type NotificationType = "NEW_USER_REGISTERED" | "ACCESS_GRANTED" | "NEW_CONTENT";

interface NotificationItem {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
}

function timeAgo(date: Date): string {
	const diff = Date.now() - new Date(date).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "Baru saja";
	if (minutes < 60) return `${minutes} menit lalu`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} jam lalu`;
	const days = Math.floor(hours / 24);
	return `${days} hari lalu`;
}

function NotifIcon({ type }: { type: NotificationType }) {
	const base = "size-4 shrink-0 mt-0.5";
	if (type === "NEW_USER_REGISTERED")
		return <UserPlus className={`${base} text-blue-500`} />;
	if (type === "ACCESS_GRANTED")
		return <ShieldCheck className={`${base} text-emerald-500`} />;
	return <Video className={`${base} text-violet-500`} />;
}

export function NotificationBell() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [open, setOpen] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchNotifications = useCallback(async () => {
		try {
			const result = await getNotificationsAction({ limit: 20 });
			if (result && "data" in result && result.data) {
				setNotifications(result.data.notifications as NotificationItem[]);
				setUnreadCount(result.data.unreadCount);
			}
		} catch {
			// silent fail
		}
	}, []);

	useEffect(() => {
		fetchNotifications();
		intervalRef.current = setInterval(fetchNotifications, 30000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [fetchNotifications]);

	async function handleOpen(isOpen: boolean) {
		setOpen(isOpen);
		if (isOpen && unreadCount > 0) {
			const unreadIds = notifications
				.filter((n) => !n.isRead)
				.map((n) => n.id);
			if (unreadIds.length > 0) {
				await markNotificationsReadAction({ ids: unreadIds });
				setUnreadCount(0);
				setNotifications((prev) =>
					prev.map((n) => ({ ...n, isRead: true })),
				);
			}
		}
	}

	async function handleMarkAllRead() {
		await markNotificationsReadAction({});
		setUnreadCount(0);
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	}

	return (
		<DropdownMenu open={open} onOpenChange={handleOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative text-slate-600 hover:text-primary"
					aria-label="Notifikasi"
				>
					<Bell className="size-5" />
					{unreadCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-80 p-0"
				sideOffset={8}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b px-4 py-3">
					<div>
						<p className="text-sm font-semibold">Notifikasi</p>
						{unreadCount > 0 && (
							<p className="text-xs text-muted-foreground">
								{unreadCount} belum dibaca
							</p>
						)}
					</div>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 gap-1 text-xs text-muted-foreground"
							onClick={handleMarkAllRead}
						>
							<CheckCheck className="size-3.5" />
							Tandai semua
						</Button>
					)}
				</div>

				{/* List */}
				<div className="max-h-[360px] overflow-y-auto">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
							<Bell className="size-8 opacity-30" />
							<p>Belum ada notifikasi</p>
						</div>
					) : (
						<ul className="divide-y">
							{notifications.map((notif) => (
								<li
									key={notif.id}
									className={`flex items-start gap-3 px-4 py-3 transition-colors ${
										!notif.isRead ? "bg-blue-50/60" : "hover:bg-muted/40"
									}`}
								>
									<NotifIcon type={notif.type} />
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium leading-tight">
											{notif.title}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
											{notif.message}
										</p>
										<p className="mt-1 text-[11px] text-muted-foreground/70">
											{timeAgo(notif.createdAt)}
										</p>
									</div>
									{!notif.isRead && (
										<span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
