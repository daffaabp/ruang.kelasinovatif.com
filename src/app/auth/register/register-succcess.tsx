"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function RegisterSuccess() {
	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Registration Successful</CardTitle>
				<CardDescription>
					Please complete your profile to continue
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col items-center justify-center gap-4 text-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-sm text-muted-foreground">
						Redirecting you to complete your profile information...
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
