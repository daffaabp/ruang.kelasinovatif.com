"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Edit, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { updateCourseAction } from "./course-actions";
import type { PaginatedResult } from "./course-types";
import { updateCourseSchema } from "./course-validations";

interface CourseEditModalProps {
	course: {
		id: string;
		courseName: string;
		courseDescription: string;
		price?: string | null;
		linkPayment?: string | null;
	};
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
											price: input.price || null,
											linkPayment: input.linkPayment || null,
										}
									: c,
							),
						};
					},
					onSuccess: (result) => {
						if (result && "data" in result && result.data?.success) {
							setOpen(false);
							toast.success("Course updated successfully");
							resetFormAndAction();
							onDataChange(courses);
						} else {
							toast.error(
								typeof result?.data?.error === "string"
									? result.data.error
									: "Failed to update course",
							);
						}
					},
					onError: (error) => {
						toast.error(
							typeof error === "string" ? error : "Failed to update course",
						);
					},
				},
				formProps: {
					defaultValues: {
						id: course.id,
						courseName: course.courseName,
						courseDescription: course.courseDescription,
						price: course.price || undefined,
						linkPayment: course.linkPayment || undefined,
					},
				},
			},
		);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Edit className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] p-0 sm:p-6">
				<DialogHeader className="px-4 sm:px-0 pt-4 sm:pt-0">
					<DialogTitle>Edit Course</DialogTitle>
					<DialogDescription>
						Update course details by filling out the form below.
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
							name="courseName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course Name</FormLabel>
									<FormControl>
										<Input placeholder="Enter course name" {...field} />
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
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter course description"
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="price"
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem>
										<FormLabel>Price (Optional)</FormLabel>
										<FormControl>
											<Input
												type="text"
												placeholder="Enter price in Rupiah"
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
										<FormLabel>Payment Link (Optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter payment link"
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
						<div className="flex justify-end">
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update Course"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
