"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginSuccess() {
	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Login Successful</CardTitle>
				<CardDescription>You have successfully logged in</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">
						Redirecting you to the dashboard...
					</p>
					<Button asChild>
						<Link href="/dashboard">Go to Dashboard</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
