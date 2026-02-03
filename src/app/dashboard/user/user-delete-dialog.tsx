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

import { deleteUserAction } from "./user-actions";
import type { PaginatedResult, UserWithProfile } from "./user-types";

interface UserDeleteDialogProps {
	user: UserWithProfile;
	tableData: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
}

export function UserDeleteDialog({
	user,
	tableData,
	onDataChange,
}: UserDeleteDialogProps) {
	const [open, setOpen] = useState(false);

	const { execute, isExecuting } = useOptimisticAction(deleteUserAction, {
		currentState: tableData,
		updateFn: (state) => {
			const newData = state.data.filter((u) => u.id !== user.id);
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
					case "HAS_ACTIVE_COURSES":
						toast.error(result.data.error.serverError, {
							description:
								"Hapus semua course user ini terlebih dahulu di menu User Management.",
						});
						break;
					case "NOT_FOUND":
						toast.error("User tidak ditemukan", {
							description: "User mungkin sudah dihapus atau tidak tersedia.",
						});
						break;
					case "IS_ADMIN":
						toast.error("Tidak dapat menghapus user admin", {
							description: "User dengan role admin tidak dapat dihapus dari sistem.",
						});
						break;
					default:
						toast.error(result.data.error.serverError || "Terjadi kesalahan");
				}
			}
		},
		onError: () => {
			toast.error("Gagal menghapus user", {
				description: "Terjadi kesalahan sistem. Silakan coba lagi nanti.",
			});
		},
		onSettled: () => {
			onDataChange(tableData);
		},
	});

	const handleDelete = () => {
		if (user.isAdmin) {
			toast.error("Tidak dapat menghapus user admin", {
				description: "User dengan role admin tidak dapat dihapus dari sistem.",
			});
			setOpen(false);
			return;
		}
		execute({ id: user.id });
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button 
					variant="ghost" 
					size="icon"
					disabled={user.isAdmin}
					title={user.isAdmin ? "Tidak dapat menghapus user admin" : "Hapus user"}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="sm:max-w-[400px] p-0 sm:p-6">
				<AlertDialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<AlertDialogTitle>Hapus User</AlertDialogTitle>
					<div className="space-y-2">
						<AlertDialogDescription>
							Apakah Anda yakin ingin menghapus user &ldquo;
							{user.UserProfile
								? `${user.UserProfile.firstName} ${user.UserProfile.lastName}`
								: user.email}
							&rdquo;?
						</AlertDialogDescription>
						<AlertDialogDescription className="text-sm text-muted-foreground">
							Pastikan user tidak memiliki course aktif terlebih dahulu.
							Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</div>
				</AlertDialogHeader>
				<AlertDialogFooter className="px-4 sm:px-0 pb-4 sm:pb-0">
					<AlertDialogCancel>Batal</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isExecuting || user.isAdmin}
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
