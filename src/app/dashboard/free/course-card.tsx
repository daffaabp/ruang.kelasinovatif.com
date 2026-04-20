"use client";

import { Badge } from "@/components/ui/badge";
import { cn, toTitleCase } from "@/lib/utils";
import { CourseType } from "@prisma/client";
import { BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
	id: string;
	title: string;
	description: string;
	courseType: CourseType;
	courseName: string;
	videoUrl?: string | null;
	downloadUrl?: string | null;
}

export function CourseCard({
	id,
	title,
	description,
	courseType,
}: CourseCardProps) {
	const isVideo = courseType === CourseType.VIDEO;

	return (
		<Link href={`/dashboard/free/${id}`} className="block group">
			<div
				className={cn(
					"flex flex-col h-full rounded-xl border bg-white overflow-hidden",
					"transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
					"border-border/60 hover:border-slate-300",
				)}
			>
				{/* Top accent stripe */}
				<div
					className={cn(
						"h-1 w-full shrink-0",
						isVideo ? "bg-emerald-400" : "bg-amber-400",
					)}
				/>

				<div className="flex flex-col flex-1 p-4 gap-3">
					{/* Type badge */}
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
								isVideo
									? "bg-emerald-50 text-emerald-600"
									: "bg-amber-50 text-amber-600",
							)}
						>
							{isVideo ? (
								<PlayCircle className="h-4 w-4" />
							) : (
								<BookOpen className="h-4 w-4" />
							)}
						</div>
						<Badge
							variant="outline"
							className={cn(
								"text-xs font-medium border",
								isVideo
									? "text-emerald-700 border-emerald-200 bg-emerald-50"
									: "text-amber-700 border-amber-200 bg-amber-50",
							)}
						>
							{isVideo ? "Video" : "E-Book"}
						</Badge>
						<span className="ml-auto">
							<Badge
								variant="secondary"
								className="text-xs bg-slate-100 text-slate-500 font-normal"
							>
								Gratis
							</Badge>
						</span>
					</div>

					{/* Title */}
					<h3 className="font-semibold text-sm sm:text-[15px] text-foreground leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
						{toTitleCase(title)}
					</h3>

					{/* Description */}
					<p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">
						{description}
					</p>

					{/* Footer CTA */}
					<div
						className={cn(
							"flex items-center justify-between pt-3 border-t border-border/50 mt-auto",
						)}
					>
						<span
							className={cn(
								"text-sm font-medium transition-colors duration-200",
								isVideo
									? "text-emerald-600 group-hover:text-emerald-700"
									: "text-amber-600 group-hover:text-amber-700",
							)}
						>
							Lihat Detail
						</span>
						<ChevronRight
							className={cn(
								"h-4 w-4 transition-all duration-200 group-hover:translate-x-0.5",
								isVideo ? "text-emerald-500" : "text-amber-500",
							)}
						/>
					</div>
				</div>
			</div>
		</Link>
	);
}
