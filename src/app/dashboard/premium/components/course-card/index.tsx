"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
} from "@/components/ui/card";
import { CourseType } from "@prisma/client";
import { Eye } from "lucide-react";
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
	// courseName,
	videoUrl,
	downloadUrl,
	id,
}: CourseCardProps) {
	return (
		<Card className="w-full">
			<div className="flex flex-col md:flex-row">
				<div className="flex-1 p-6">
					<div className="flex items-center justify-between mb-4">
						<Badge
							variant={courseType === CourseType.EBOOK ? "default" : "secondary"}
						>
							{courseType === CourseType.EBOOK ? "E-Book" : "Video"}
						</Badge>
					</div>
					<h3 className="text-xl font-semibold mb-2">{title}</h3>
					<p className="text-muted-foreground">
						{description}
					</p>
				</div>
				<div className="flex items-center justify-end p-6 border-t md:border-t-0 md:border-l bg-muted/50">
					{courseType === CourseType.VIDEO && videoUrl && (
						<Button variant="outline" asChild>
							<Link href={`/dashboard/premium/${id}`}>
								<Eye className="mr-2 h-4 w-4" />
								Lihat Detail
							</Link>
						</Button>
					)}
					{courseType === CourseType.EBOOK && downloadUrl && (
						<Button variant="outline" asChild>
							<Link href={`/dashboard/premium/${id}`}>
								<Eye className="mr-2 h-4 w-4" />
								Lihat Detail
							</Link>
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
