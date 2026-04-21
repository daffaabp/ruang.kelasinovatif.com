"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import type { CourseDetails } from "@prisma/client";
import { CourseType } from "@prisma/client";
import { Loader2, Pencil } from "lucide-react";
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

import type { AccessType } from "@prisma/client";
import { updateDetailCourseAction } from "./detailcourse-actions";
import type { PaginatedResult } from "./detailcourse-types";
import { updateDetailCourseSchema } from "./detailcourse-validations";

interface CourseOption {
	id: string;
	courseName: string;
}

interface DetailCourseEditModalProps {
	detail: CourseDetails & { course: { courseName: string } };
	tableData: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
	courseOptions: CourseOption[];
}

export function DetailCourseEditModal({
	detail,
	tableData,
	onDataChange,
	courseOptions,
}: DetailCourseEditModalProps) {
	const [open, setOpen] = useState(false);
	const [selectedCourseType, setSelectedCourseType] = useState<CourseType>(detail.courseType);

	const { form, handleSubmitWithAction } = useHookFormOptimisticAction(
		updateDetailCourseAction,
		zodResolver(updateDetailCourseSchema),
		{
			actionProps: {
				currentState: tableData,
				updateFn: (state, input) => {
					const newData = state.data.map((d) =>
						d.id === input.id
							? {
									...d,
									courseId: input.courseId,
									title: input.title,
									description: input.description,
									courseType: input.courseType,
									videoUrl: input.videoUrl,
									downloadUrl: input.downloadUrl,
									updatedAt: new Date(),
					course: courseOptions.find((c) => c.id === input.courseId)
									? {
											courseName:
												courseOptions.find((c) => c.id === input.courseId)
													?.courseName ?? "Unknown",
											accessType: d.course.accessType as AccessType,
										}
									: d.course,
								}
							: d,
					);
					return {
						...state,
						data: newData,
					};
				},
				onSuccess: (result) => {
					if (result && "data" in result && result.data?.message) {
						toast.success(result.data.message);
						setOpen(false);
						form.reset();
						onDataChange(tableData);
					} else {
						toast.error("Gagal memperbarui detail course");
					}
				},
				onError: (error) => {
					if (error && typeof error === "object" && "error" in error) {
						const err = error as { error: { serverError?: string } };
						toast.error(
							err.error?.serverError || "Gagal memperbarui detail course",
						);
					} else {
						toast.error("Gagal memperbarui detail course");
					}
				},
			},
			formProps: {
				defaultValues: {
					id: detail.id,
					courseId: detail.courseId,
					title: detail.title,
					description: detail.description,
					courseType: detail.courseType,
					videoUrl: detail.videoUrl || "",
					downloadUrl: detail.downloadUrl || "",
				},
			},
		},
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] p-0 sm:p-6">
				<DialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<DialogTitle>Edit Course Detail</DialogTitle>
					<DialogDescription>
						Edit detail course dengan mengisi form di bawah ini.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={handleSubmitWithAction}
						className="space-y-4 px-4 sm:px-0 pb-4 sm:pb-0"
					>
						<input type="hidden" {...form.register("id")} />
						<FormField
							control={form.control}
							name="courseId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a course" />
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
										Memperbarui...
									</>
								) : (
									"Perbarui Detail Course"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
