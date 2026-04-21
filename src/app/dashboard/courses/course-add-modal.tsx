"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { AccessType } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

import { createCourseAction } from "./course-actions";
import type { PaginatedResult } from "./course-types";
import { courseFormSchema } from "./course-validations";

export function CourseAddModal({ courses }: { courses: PaginatedResult }) {
	const [open, setOpen] = useState(false);

	const { form, handleSubmitWithAction, resetFormAndAction } =
		useHookFormOptimisticAction(
			createCourseAction,
			zodResolver(courseFormSchema),
			{
				formProps: {
					defaultValues: {
						courseName: "",
						courseDescription: "",
						accessType: AccessType.PREMIUM,
						price: undefined,
						linkPayment: undefined,
						thumbnailUrl: undefined,
					},
				},
				actionProps: {
					currentState: courses,
					updateFn: (state, input) => {
						return {
							...state,
							data: [
								{
									id: Date.now().toString(),
									courseName: input.courseName,
									courseDescription: input.courseDescription,
									accessType: input.accessType ?? ("PREMIUM" as const),
									price: input.price || null,
									linkPayment: input.linkPayment || null,
									thumbnailUrl: input.thumbnailUrl || null,
								},
								...state.data,
							],
							total: state.total + 1,
							pageCount: Math.ceil((state.total + 1) / 5),
						};
					},
					onSuccess: (result) => {
						if (result && "data" in result && result.data?.success) {
							setOpen(false);
							toast.success("Jenis course berhasil dibuat");
							resetFormAndAction();
						} else {
							toast.error(
								typeof result?.data?.error === "string"
									? result.data.error
									: "Gagal membuat jenis course",
							);
						}
					},
					onError: (error) => {
						toast.error(
							typeof error === "string" ? error : "Gagal membuat jenis course",
						);
					},
				},
			},
		);

	const watchedAccessType = form.watch("accessType");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Tambah Jenis Course
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] p-0 sm:p-6 max-h-[90vh] overflow-y-auto">
				<DialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<DialogTitle>Tambah Jenis Course</DialogTitle>
					<DialogDescription>
						Buat jenis course baru (contoh: Workshop NotebookLM, Ngabuburit AI).
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={handleSubmitWithAction}
						className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0"
					>
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
									"Simpan"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
