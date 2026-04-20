"use client";

import { cn } from "@/lib/utils";
import { CourseType } from "@prisma/client";
import { BookOpen, LayoutGrid, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";

interface CourseFilterProps {
	selectedCourseType: CourseType | "ALL";
	onCourseTypeSelect: (value: CourseType | "ALL") => void;
}

const filters: {
	value: CourseType | "ALL";
	label: string;
	icon: ReactNode;
}[] = [
	{
		value: "ALL",
		label: "Semua",
		icon: <LayoutGrid className="h-4 w-4" />,
	},
	{
		value: CourseType.VIDEO,
		label: "Video",
		icon: <PlayCircle className="h-4 w-4" />,
	},
	{
		value: CourseType.EBOOK,
		label: "E-Book",
		icon: <BookOpen className="h-4 w-4" />,
	},
];

export function CourseFilter({
	selectedCourseType,
	onCourseTypeSelect,
}: CourseFilterProps) {
	return (
		<div className="flex items-center gap-2 p-1 rounded-xl bg-muted/60 border border-border/50 w-fit">
			{filters.map((filter) => {
				const isActive = selectedCourseType === filter.value;
				return (
					<button
						key={filter.value}
						onClick={() => onCourseTypeSelect(filter.value)}
						className={cn(
							"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
							isActive
								? "bg-white shadow-sm text-emerald-700 border border-emerald-100"
								: "text-muted-foreground hover:text-foreground hover:bg-white/50",
						)}
					>
						<span
							className={cn(
								"transition-colors duration-200",
								isActive ? "text-emerald-600" : "text-muted-foreground",
							)}
						>
							{filter.icon}
						</span>
						{filter.label}
					</button>
				);
			})}
		</div>
	);
}
