"use client";

import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Loader2, LogOutIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

export function LogoutButton() {
	const { execute, status } = useAction(logoutAction);

	return (
		<Button onClick={() => execute()} disabled={status === "executing"}>
			{status === "executing" ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Logout
				</>
			) : (
				<>
					<LogOutIcon className="mr-2 h-4 w-4" />
					Logout
				</>
			)}
		</Button>
	);
}
