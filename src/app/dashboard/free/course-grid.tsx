"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CourseType } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { getFreeCoursesAction } from "./course-actions";
import { CourseCard } from "./course-card";
import type { PaginatedResult } from "./course-types";

interface CourseGridProps {
	initialData: PaginatedResult;
}

export function CourseGrid({ initialData }: CourseGridProps) {
	const [loading, setLoading] = useState(false);
	const [courseType, setCourseType] = useState<CourseType | "ALL">("ALL");
	const [data, setData] = useState<PaginatedResult>(initialData);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getFreeCoursesAction({
				courseType: courseType === "ALL" ? undefined : courseType,
			});

			if (result && "data" in result && result.data) {
				setData(result.data);
			}
		} catch (error) {
			console.error("Error fetching courses:", error);
		} finally {
			setLoading(false);
		}
	}, [courseType]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className="space-y-4">
			{/* Filter */}
			<div className="flex justify-start">
				<Select
					value={courseType}
					onValueChange={(value) => setCourseType(value as CourseType | "ALL")}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Pilih Tipe" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Semua Tipe</SelectItem>
						<SelectItem value={CourseType.EBOOK}>E-Book</SelectItem>
						<SelectItem value={CourseType.VIDEO}>Video</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Grid */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 9 }).map(() => (
						<div
							key={`skeleton-${crypto.randomUUID()}`}
							className="h-[200px] rounded-lg bg-muted animate-pulse"
						/>
					))}
				</div>
			) : data.data.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{data.data.map((course) => (
						<CourseCard
							key={course.id}
							id={course.id}
							title={course.title}
							description={course.description}
							courseType={course.courseType}
							courseName={course.course.courseName}
							videoUrl={course.videoUrl}
							downloadUrl={course.downloadUrl}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12 bg-muted/50 rounded-lg">
					<div className="max-w-md mx-auto space-y-4">
						<h3 className="text-lg font-semibold">
							Tidak ada materi ditemukan
						</h3>
						<p className="text-sm text-muted-foreground">
							Coba pilih tipe materi yang lain
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
