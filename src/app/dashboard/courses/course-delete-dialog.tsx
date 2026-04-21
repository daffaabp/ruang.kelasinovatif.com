"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteCourseAction } from "./course-actions";
import type { PaginatedResult } from "./course-types";

interface CourseDeleteDialogProps {
	course: { id: string; courseName: string };
	tableData: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
}

export function CourseDeleteDialog({
	course,
	tableData,
	onDataChange,
}: CourseDeleteDialogProps) {
	const [open, setOpen] = useState(false);

	const { execute, isExecuting } = useOptimisticAction(deleteCourseAction, {
		currentState: tableData,
		updateFn: (state) => {
			const newData = state.data.filter((d) => d.id !== course.id);
			return {
				data: newData,
				total: state.total - 1,
				pageCount: Math.ceil((state.total - 1) / 5),
			};
		},
		onSuccess: (result) => {
			if (result?.data?.data?.type === "SUCCESS") {
				toast.success(result.data.data.message);
				setOpen(false);
			} else if (result?.data?.error) {
				switch (result.data.error.type) {
					case "COURSE_IN_USE":
						toast.error(result.data.error.serverError, {
							description:
								"Hapus semua user dari course ini terlebih dahulu di menu User Management.",
						});
						break;
					case "HAS_COURSE_DETAILS":
						toast.error(result.data.error.serverError, {
							description:
								"Hapus semua detail materi di menu Detail Course terlebih dahulu.",
						});
						break;
					case "NOT_FOUND":
						toast.error("Course tidak ditemukan", {
							description: "Course mungkin sudah dihapus atau tidak tersedia.",
						});
						break;
					default:
						toast.error(result.data.error.serverError || "Terjadi kesalahan");
				}
			}
		},
		onError: () => {
			toast.error("Gagal menghapus course", {
				description: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
			});
		},
		onSettled: () => {
			onDataChange(tableData);
		},
	});

	const handleDelete = () => {
		execute({ id: course.id });
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="sm:max-w-[400px] p-0 sm:p-6">
				<AlertDialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<AlertDialogTitle>Hapus Course</AlertDialogTitle>
					<div className="space-y-2">
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus course &ldquo;
							{course.courseName}&rdquo;?
						</AlertDialogDescription>
						<AlertDialogDescription className="text-sm text-muted-foreground">
							Pastikan semua detail materi dan user telah dihapus terlebih
							dahulu. Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</div>
				</AlertDialogHeader>
				<AlertDialogFooter className="px-4 sm:px-0 pb-4 sm:pb-0">
					<AlertDialogCancel>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isExecuting}
						className="bg-destructive hover:bg-destructive/90"
					>
						{isExecuting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Menghapus...
							</>
						) : (
							"Hapus"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
