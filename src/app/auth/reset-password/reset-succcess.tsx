"use client";

import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ResetSuccess() {
	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Password Reset Successful</CardTitle>
				<CardDescription>Your password has been reset</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<p className="text-sm text-muted-foreground">
						You can now login with your new password
					</p>
					<Button asChild>
						<Link href="/auth/login">Go to Login</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
