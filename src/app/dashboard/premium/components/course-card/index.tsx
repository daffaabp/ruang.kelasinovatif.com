"use client";

import { Badge } from "@/components/ui/badge";
import { cn, toTitleCase } from "@/lib/utils";
import { CourseType } from "@prisma/client";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
	title: string;
	description: string;
	courseType: CourseType;
	courseName: string;
	videoUrl?: string | null;
	downloadUrl?: string | null;
	id: string;
}

export function CourseCard({
	title,
	description,
	courseType,
	// courseName used for grouping in parent
	videoUrl,
	downloadUrl,
	id,
}: CourseCardProps) {
	const isVideo = courseType === CourseType.VIDEO;
	const hasContent = isVideo ? !!videoUrl : !!downloadUrl;
	const readableTitle = toTitleCase(title);

	const cardContent = (
		<div
			className={cn(
				"group relative rounded-2xl border bg-white overflow-hidden transition-all duration-300",
				"hover:shadow-lg hover:-translate-y-0.5",
				hasContent
					? "border-border/60 hover:border-emerald-300 cursor-pointer"
					: "border-border/40 opacity-80",
			)}
		>
			{/* Top color stripe */}
			<div
				className={cn(
					"h-1.5 w-full",
					isVideo
						? "bg-gradient-to-r from-emerald-400 to-emerald-500"
						: "bg-gradient-to-r from-amber-400 to-amber-500",
				)}
			/>

			<div className="p-5">
				{/* Header row: Icon + Type badge */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2.5">
						<div
							className={cn(
								"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
								isVideo
									? "bg-emerald-100 text-emerald-700"
									: "bg-amber-100 text-amber-700",
							)}
						>
							{isVideo ? (
								<PlayCircle className="h-6 w-6" />
							) : (
								<BookOpen className="h-6 w-6" />
							)}
						</div>
						<Badge
							variant="outline"
							className={cn(
								"text-sm font-semibold px-3 py-1 rounded-lg border-2",
								isVideo
									? "text-emerald-700 border-emerald-200 bg-emerald-50"
									: "text-amber-700 border-amber-200 bg-amber-50",
							)}
						>
							{isVideo ? "Rekaman Video" : "E-Book"}
						</Badge>
					</div>
				</div>

				{/* Title - large and readable */}
				<h4
					className={cn(
						"font-bold text-foreground leading-snug mb-2 text-base sm:text-lg",
						"group-hover:text-emerald-700 transition-colors duration-200",
					)}
				>
					{readableTitle}
				</h4>

				{/* Description */}
				<p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
					{description}
				</p>

				{/* CTA Button - full-width, large, very obvious */}
				{hasContent ? (
					<div
						className={cn(
							"flex items-center justify-center gap-2 w-full rounded-xl py-3.5 px-4 font-semibold text-base transition-all duration-200",
							"text-white shadow-sm",
							isVideo
								? "bg-emerald-600 group-hover:bg-emerald-700 group-hover:shadow-md"
								: "bg-amber-500 group-hover:bg-amber-600 group-hover:shadow-md",
						)}
					>
						{isVideo ? (
							<>
								<PlayCircle className="h-5 w-5 shrink-0" />
								<span>Tonton Rekaman</span>
								<ArrowRight className="h-4.5 w-4.5 h-[18px] w-[18px] ml-auto" />
							</>
						) : (
							<>
								<BookOpen className="h-5 w-5 shrink-0" />
								<span>Buka E-Book</span>
								<ArrowRight className="h-[18px] w-[18px] ml-auto" />
							</>
						)}
					</div>
				) : (
					<div className="flex items-center justify-center w-full rounded-xl py-3.5 px-4 bg-muted text-muted-foreground text-sm font-medium">
						Materi belum tersedia
					</div>
				)}
			</div>
		</div>
	);

	if (!hasContent) return cardContent;

	return (
		<Link href={`/dashboard/premium/${id}`} className="block">
			{cardContent}
		</Link>
	);
}
