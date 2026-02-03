"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Lock, Unlock } from "lucide-react";
import Link from "next/link";

export function QuickAccessCard() {
	return (
		<>
			{/* Free Course Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Unlock className="w-4 h-4 text-muted-foreground" />
						<CardTitle className="text-base">Materi Free</CardTitle>
					</div>
					<CardDescription>
						Akses materi dasar untuk memulai pembelajaran Anda
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild className="w-full">
						<Link href="/dashboard/free">Akses Materi</Link>
					</Button>
				</CardContent>
			</Card>

			{/* Premium Course Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Lock className="w-4 h-4 text-primary" />
						<CardTitle className="text-base">Materi Premium</CardTitle>
					</div>
					<CardDescription>
						Akses materi premium yang Anda miliki
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild className="w-full">
						<Link href="/dashboard/premium">Akses Materi</Link>
					</Button>
				</CardContent>
			</Card>
		</>
	);
}
