"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CourseType } from "@prisma/client";

interface CourseFilterProps {
	selectedCourseType: CourseType | "ALL";
	onCourseTypeSelect: (value: CourseType | "ALL") => void;
}

export function CourseFilter({
	selectedCourseType,
	onCourseTypeSelect,
}: CourseFilterProps) {
	return (
		<Select
			value={selectedCourseType}
			onValueChange={(value) => onCourseTypeSelect(value as CourseType | "ALL")}
		>
			<SelectTrigger className="w-full sm:w-[180px]">
				<SelectValue placeholder="Pilih Tipe" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="ALL">Semua Tipe</SelectItem>
				<SelectItem value={CourseType.VIDEO}>Video</SelectItem>
				<SelectItem value={CourseType.EBOOK}>E-Book</SelectItem>
			</SelectContent>
		</Select>
	);
}
