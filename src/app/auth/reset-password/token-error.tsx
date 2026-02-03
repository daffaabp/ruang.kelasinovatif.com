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
import { AlertCircle } from "lucide-react";

interface TokenErrorProps {
	message: string;
}

export function TokenError({ message }: TokenErrorProps) {
	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Reset Link Error</CardTitle>
				<CardDescription>Unable to reset your password</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<AlertCircle className="h-8 w-8 text-destructive" />
					<p className="text-sm text-muted-foreground">{message}</p>
					<Button asChild>
						<Link href="/auth/forgot-password">Request New Reset Link</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
