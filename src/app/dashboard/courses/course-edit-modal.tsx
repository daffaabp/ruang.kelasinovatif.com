"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { AccessType } from "@prisma/client";
import { AlertTriangle, Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updateCourseAction } from "./course-actions";
import type { Course, PaginatedResult } from "./course-types";
import { updateCourseSchema } from "./course-validations";

interface CourseEditModalProps {
	course: Course;
	courses: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
}

export function CourseEditModal({
	course,
	courses,
	onDataChange,
}: CourseEditModalProps) {
	const [open, setOpen] = useState(false);

	const { form, handleSubmitWithAction, resetFormAndAction } =
		useHookFormOptimisticAction(
			updateCourseAction,
			zodResolver(updateCourseSchema),
			{
				actionProps: {
					currentState: courses,
					updateFn: (state, input) => {
						return {
							...state,
							data: state.data.map((c) =>
								c.id === input.id
									? {
											...c,
											courseName: input.courseName,
											courseDescription: input.courseDescription,
											accessType: input.accessType ?? ("PREMIUM" as const),
											price: input.price || null,
											linkPayment: input.linkPayment || null,
											thumbnailUrl: input.thumbnailUrl || null,
										}
									: c,
							),
						};
					},
					onSuccess: (result) => {
						if (result && "data" in result && result.data?.success) {
							setOpen(false);
							toast.success("Jenis course berhasil diperbarui");
							resetFormAndAction();
							onDataChange(courses);
						} else {
							toast.error(
								typeof result?.data?.error === "string"
									? result.data.error
									: "Gagal memperbarui jenis course",
							);
						}
					},
					onError: (error) => {
						toast.error(
							typeof error === "string"
								? error
								: "Gagal memperbarui jenis course",
						);
					},
				},
				formProps: {
					defaultValues: {
						id: course.id,
						courseName: course.courseName,
						courseDescription: course.courseDescription,
						accessType: course.accessType,
						price: course.price || undefined,
						linkPayment: course.linkPayment || undefined,
						thumbnailUrl: course.thumbnailUrl || undefined,
					},
				},
			},
		);

	const watchedAccessType = form.watch("accessType");
	const isChangingToPremiun =
		course.accessType === AccessType.FREE &&
		watchedAccessType === AccessType.PREMIUM;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Edit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
				<DialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<DialogTitle>Edit Jenis Course</DialogTitle>
					<DialogDescription>
						Perbarui informasi jenis course ini.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={handleSubmitWithAction}
						className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0"
					>
						<input type="hidden" {...form.register("id")} />

						{isChangingToPremiun && (
							<Alert className="border-amber-300 bg-amber-50">
								<AlertTriangle className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-800 text-sm">
									Anda mengubah akses dari <strong>Free → Premium</strong>. User
									yang tadinya bisa akses otomatis sekarang harus di-grant manual
									di menu Users.
								</AlertDescription>
							</Alert>
						)}

						<FormField
							control={form.control}
							name="courseName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nama Jenis Course</FormLabel>
									<FormControl>
										<Input
											placeholder="cth: Workshop NotebookLM"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="courseDescription"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Deskripsi</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Deskripsi singkat tentang jenis course ini"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="accessType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tipe Akses</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Pilih tipe akses" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={AccessType.PREMIUM}>
												🔒 Premium — harus di-grant ke user
											</SelectItem>
											<SelectItem value={AccessType.FREE}>
												🆓 Free — semua user bisa akses
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{watchedAccessType === AccessType.PREMIUM && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="price"
									render={({ field: { value, onChange, ...field } }) => (
										<FormItem>
											<FormLabel>Harga (Rp)</FormLabel>
											<FormControl>
												<Input
													type="text"
													placeholder="cth: 350000"
													{...field}
													value={value ?? ""}
													onChange={(e) => {
														const val = e.target.value;
														onChange(val === "" ? undefined : val);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="linkPayment"
									render={({ field: { value, onChange, ...field } }) => (
										<FormItem>
											<FormLabel>Link Pembayaran</FormLabel>
											<FormControl>
												<Input
													placeholder="https://..."
													{...field}
													value={value ?? ""}
													onChange={(e) => {
														const val = e.target.value;
														onChange(val === "" ? undefined : val);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

						<FormField
							control={form.control}
							name="thumbnailUrl"
							render={({ field: { value, onChange, ...field } }) => (
								<FormItem>
									<FormLabel>URL Thumbnail (Opsional)</FormLabel>
									<FormControl>
										<Input
											placeholder="https://..."
											{...field}
											value={value ?? ""}
											onChange={(e) => {
												const val = e.target.value;
												onChange(val === "" ? undefined : val);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Menyimpan...
									</>
								) : (
									"Simpan Perubahan"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
