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
import { CheckCircle2 } from "lucide-react";

export function ForgotSuccess() {
	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Reset Email Sent</CardTitle>
				<CardDescription>
					Check your email for reset instructions
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<CheckCircle2 className="h-8 w-8 text-primary" />
					<p className="text-sm text-muted-foreground">
						We have sent you an email with instructions to reset your password.
					</p>
					<Button asChild>
						<Link href="/auth/login">Back to Login</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
