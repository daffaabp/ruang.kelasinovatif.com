"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { CourseType } from "@prisma/client";
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

import { createDetailCourseAction } from "./detailcourse-actions";
import type { PaginatedResult } from "./detailcourse-types";
import { detailCourseFormSchema } from "./detailcourse-validations";
import type { AccessType } from "@prisma/client";

interface CourseOption {
	id: string;
	courseName: string;
}

interface DetailCourseAddModalProps {
	details: PaginatedResult;
	courseOptions: CourseOption[];
	/** Kalau diisi, dropdown Course disembunyikan dan courseId di-lock ke nilai ini */
	fixedCourseId?: string;
	/** Label tombol, default "Tambah Detail Course" */
	buttonLabel?: string;
}

function generateTempId() {
	return `temp_${Math.random().toString(36).substr(2, 9)}`;
}

export function DetailCourseAddModal({
	details,
	courseOptions,
	fixedCourseId,
	buttonLabel = "Tambah Detail Course",
}: DetailCourseAddModalProps) {
	const [open, setOpen] = useState(false);
	const [selectedCourseType, setSelectedCourseType] = useState<CourseType>(CourseType.EBOOK);

	const { form, handleSubmitWithAction, resetFormAndAction } =
		useHookFormOptimisticAction(
			createDetailCourseAction,
			zodResolver(detailCourseFormSchema),
			{
				actionProps: {
					currentState: details,
					updateFn: (state, input) => ({
						...state,
						data: [
							{
								id: generateTempId(),
								courseId: input.courseId,
								title: input.title,
								description: input.description,
								courseType: input.courseType,
								videoUrl: input.videoUrl,
								downloadUrl: input.downloadUrl,
								createdAt: new Date(),
								updatedAt: new Date(),
								course: (() => {
								const foundCourse = courseOptions.find(
									(c) => c.id === input.courseId,
								);
								return foundCourse
									? {
											courseName: foundCourse.courseName,
											accessType: "PREMIUM" as AccessType,
										}
									: {
											courseName: "Unknown",
											accessType: "PREMIUM" as AccessType,
										};
							})(),
							},
							...state.data,
						],
						total: state.total + 1,
						pageCount: Math.ceil((state.total + 1) / 5),
					}),
					onSuccess: (result) => {
						if (result && "data" in result && result.data?.success) {
							setOpen(false);
							toast.success("Detail course berhasil dibuat");
							resetFormAndAction();
						} else {
							toast.error(
								typeof result?.data?.error === "string"
									? result.data.error
									: "Gagal membuat detail course",
							);
						}
					},
					onError: (error) => {
						toast.error(
							typeof error === "string" ? error : "Gagal membuat detail course",
						);
					},
				},
			formProps: {
				defaultValues: {
					courseId: fixedCourseId ?? "",
					title: "",
					description: "",
					courseType: CourseType.EBOOK,
					videoUrl: "",
					downloadUrl: "",
				},
			},
			},
		);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
		<DialogTrigger asChild>
			<Button>
				<Plus className="mr-2 h-4 w-4" />
				{buttonLabel}
			</Button>
		</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] p-0 sm:p-6">
				<DialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<DialogTitle>Add New Course Detail</DialogTitle>
					<DialogDescription>
						Buat detail course baru dengan mengisi form di bawah ini.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={handleSubmitWithAction}
						className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0"
					>
					{fixedCourseId ? (
						<input type="hidden" {...form.register("courseId")} />
					) : (
						<FormField
							control={form.control}
							name="courseId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Jenis Course</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Pilih jenis course" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{courseOptions.map((course) => (
												<SelectItem key={course.id} value={course.id}>
													{course.courseName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter detail title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter detail description"
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="courseType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course Type</FormLabel>
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											setSelectedCourseType(value as CourseType);
											// Reset URL fields when type changes
											if (value === CourseType.VIDEO) {
												form.setValue("downloadUrl", "");
											} else {
												form.setValue("videoUrl", "");
											}
										}}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select course type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={CourseType.EBOOK}>E-Book</SelectItem>
											<SelectItem value={CourseType.VIDEO}>Video</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						{selectedCourseType === CourseType.VIDEO && (
							<FormField
								control={form.control}
								name="videoUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Video URL</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter YouTube video URL"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						{selectedCourseType === CourseType.EBOOK && (
							<FormField
								control={form.control}
								name="downloadUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Download URL</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter download URL (Google Drive recommended)"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<div className="flex justify-end">
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Menambahkan...
									</>
								) : (
									"Tambah Detail Course"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
