"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CourseType } from "@prisma/client";
import { Eye } from "lucide-react";
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
	courseName,
}: CourseCardProps) {
	return (
		<Card className="flex flex-col h-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Badge
						variant={courseType === CourseType.EBOOK ? "default" : "secondary"}
						className="mb-2"
					>
						{courseType === CourseType.EBOOK ? "E-Book" : "Video"}
					</Badge>
					<Badge variant="outline">{courseName}</Badge>
				</div>
				<CardTitle className="line-clamp-1">{title}</CardTitle>
				<CardDescription className="line-clamp-2">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-grow">
				{/* Content can be added here if needed */}
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button variant="outline" asChild>
					<Link href={`/dashboard/free/${id}`}>
						<Eye className="mr-2 h-4 w-4" />
						Lihat Detail
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
