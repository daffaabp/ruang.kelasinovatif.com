"use client";

import type { CourseDetails } from "@prisma/client";
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

import { deleteDetailCourseAction } from "./detailcourse-actions";
import type { PaginatedResult } from "./detailcourse-types";

interface DetailCourseDeleteDialogProps {
	detail: CourseDetails & { course: { courseName: string } };
	tableData: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
}

export function DetailCourseDeleteDialog({
	detail,
	tableData,
	onDataChange,
}: DetailCourseDeleteDialogProps) {
	const [open, setOpen] = useState(false);

	const { execute, isExecuting } = useOptimisticAction(
		deleteDetailCourseAction,
		{
			currentState: tableData,
			updateFn: (state) => {
				const newData = state.data.filter((d) => d.id !== detail.id);
				return {
					data: newData,
					total: state.total - 1,
					pageCount: Math.ceil((state.total - 1) / 5),
				};
			},
			onSuccess: (result) => {
				if (result && "data" in result && result.data?.data) {
					toast.success(result.data.data.message);
					setOpen(false);
				} else if (result?.data?.error) {
					toast.error(
						result.data.error.serverError || "Gagal menghapus detail course",
					);
				}
			},
			onError: (error) => {
				if (error && typeof error === "object" && "error" in error) {
					const err = error as { error: { serverError?: string } };
					toast.error(
						err.error?.serverError || "Gagal menghapus detail course",
					);
				} else {
					toast.error("Gagal menghapus detail course");
				}
			},
			onSettled: () => {
				onDataChange(tableData);
			},
		},
	);

	const handleDelete = () => {
		execute({ id: detail.id });
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
					<AlertDialogTitle>Hapus Detail Course</AlertDialogTitle>
					<div className="space-y-2">
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus detail materi &ldquo;
							{detail.title}&rdquo; dari course &ldquo;
							{detail.course.courseName}&rdquo;?
						</AlertDialogDescription>
						<AlertDialogDescription className="text-sm text-muted-foreground">
							Tindakan ini akan menghapus detail materi secara permanen dan
							tidak dapat dibatalkan.
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
