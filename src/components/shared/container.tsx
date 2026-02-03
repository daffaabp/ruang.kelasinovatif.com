import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
	children: ReactNode;
	variant?: "default" | "centered";
}

export function Container({ children, variant = "default" }: ContainerProps) {
	return (
		<div
			className={cn(
				"w-full",
				variant === "centered" &&
					"min-h-screen flex items-center justify-center",
			)}
		>
			{children}
		</div>
	);
}

Container.displayName = "Container";
