"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormOptimisticAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { ChevronDown, Loader2, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getPremiumCourseDetailsGroupedAction } from "../premium/actions/courses";
import { updateUserAction } from "./user-actions";
import type { PaginatedResult, UserWithProfile } from "./user-types";
import { updateUserSchema } from "./user-validations";

type CategoryWithDetails = {
	id: string;
	courseName: string;
	details: Array<{
		id: string;
		title: string;
		courseType: "VIDEO" | "EBOOK";
	}>;
};

interface UserEditModalProps {
	user: UserWithProfile;
	tableData: PaginatedResult;
	onDataChange: (data: PaginatedResult) => void;
}

export function UserEditModal({
	user,
	tableData,
	onDataChange,
}: UserEditModalProps) {
	const [open, setOpen] = useState(false);
	const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
	const [search, setSearch] = useState("");
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const result = await getPremiumCourseDetailsGroupedAction();
				if (result && "data" in result && result.data) {
					setCategories(result.data as CategoryWithDetails[]);
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};

		if (open) {
			fetchCategories();
		}
	}, [open]);

	const filteredCategories = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return categories;
		return categories
			.map((cat) => {
				const matchesCategory = cat.courseName.toLowerCase().includes(q);
				const matchingDetails = cat.details.filter((d) =>
					d.title.toLowerCase().includes(q),
				);
				if (matchesCategory) {
					return cat;
				}
				if (matchingDetails.length > 0) {
					return { ...cat, details: matchingDetails };
				}
				return null;
			})
			.filter((c): c is CategoryWithDetails => c !== null);
	}, [categories, search]);

	const { form, handleSubmitWithAction } = useHookFormOptimisticAction(
		updateUserAction,
		zodResolver(updateUserSchema),
		{
			actionProps: {
				currentState: tableData,
				updateFn: (state, input) => {
					const newData = state.data.map((u) =>
						u.id === input.id
							? {
									...u,
									email: input.email,
									UserProfile: input.profile
										? {
												firstName:
													input.profile.firstName ||
													u.UserProfile?.firstName ||
													"",
												lastName:
													input.profile.lastName ||
													u.UserProfile?.lastName ||
													"",
												phone:
													input.profile.phone || u.UserProfile?.phone || "",
												institution:
													input.profile.institution ||
													u.UserProfile?.institution ||
													"",
												address:
													input.profile.address || u.UserProfile?.address || "",
												city: input.profile.city || u.UserProfile?.city || "",
												province:
													input.profile.province ||
													u.UserProfile?.province ||
													"",
											}
										: u.UserProfile,
									UserCourseDetails: input.courseDetails
										? input.courseDetails.map((courseDetailId) => {
												const category = categories.find((c) =>
													c.details.some((d) => d.id === courseDetailId),
												);
												const detail = category?.details.find(
													(d) => d.id === courseDetailId,
												);
												return {
													id: "",
													courseDetailId,
													courseDetail: {
														id: courseDetailId,
														title: detail?.title || "Unknown",
														course: {
															id: category?.id || "",
															courseName: category?.courseName || "Unknown",
															accessType: "PREMIUM" as const,
														},
													},
												};
											})
										: u.UserCourseDetails,
								}
							: u,
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
						toast.error("Gagal memperbarui user");
					}
				},
				onError: (error) => {
					if (error && typeof error === "object" && "error" in error) {
						const err = error as { error: { serverError?: string } };
						toast.error(err.error?.serverError || "Gagal memperbarui user");
					} else {
						toast.error("Gagal memperbarui user");
					}
				},
			},
			formProps: {
				defaultValues: {
					id: user.id,
					email: user.email,
					profile: user.UserProfile || {
						firstName: "",
						lastName: "",
						phone: "",
						institution: "",
						address: "",
						city: "",
						province: "",
					},
					courseDetails:
						user.UserCourseDetails?.map((ucd) => ucd.courseDetailId) || [],
				},
			},
		},
	);

	const toggleExpanded = (id: string) => {
		setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Pencil className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col gap-0 p-0">
				<DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>
						Edit user details using the form below.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={handleSubmitWithAction}
						className="flex flex-col flex-1 overflow-hidden"
					>
						<div className="flex-1 overflow-y-auto px-4 sm:px-6">
							<div className="space-y-4 pb-4">
								<input type="hidden" {...form.register("id")} />
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="Enter email"
													{...field}
													disabled
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Profile section */}
								<div className="space-y-4">
									<div className="text-sm text-muted-foreground">
										Profile Details
									</div>
									<FormField
										control={form.control}
										name="profile.firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First Name</FormLabel>
												<FormControl>
													<Input placeholder="Enter first name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="profile.lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name</FormLabel>
												<FormControl>
													<Input placeholder="Enter last name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="profile.phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone</FormLabel>
												<FormControl>
													<Input placeholder="Enter phone number" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="profile.institution"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Institution</FormLabel>
												<FormControl>
													<Input placeholder="Enter institution" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="profile.address"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Address</FormLabel>
												<FormControl>
													<Input placeholder="Enter address" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="profile.city"
											render={({ field }) => (
												<FormItem>
													<FormLabel>City</FormLabel>
													<FormControl>
														<Input placeholder="Enter city" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="profile.province"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Province</FormLabel>
													<FormControl>
														<Input placeholder="Enter province" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								{/* Course Details access section */}
								<FormField
									control={form.control}
									name="courseDetails"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Akses Rekaman Premium</FormLabel>
											<FormControl>
												<div className="space-y-2">
													<Input
														type="search"
														placeholder="Cari kategori / rekaman..."
														value={search}
														onChange={(e) => setSearch(e.target.value)}
													/>
													<div className="max-h-[280px] overflow-y-auto p-2 border rounded-md space-y-2">
														{filteredCategories.length === 0 ? (
															<p className="text-sm text-muted-foreground text-center py-4">
																Tidak ada kategori ditemukan.
															</p>
														) : (
															filteredCategories.map((category) => {
																const allIds = category.details.map(
																	(d) => d.id,
																);
																const selectedInCategory = allIds.filter(
																	(id) => field.value?.includes(id),
																);
																const isAllSelected =
																	allIds.length > 0 &&
																	selectedInCategory.length === allIds.length;
																const isOpen = expanded[category.id] ?? true;

																return (
																	<div
																		key={category.id}
																		className="border rounded-md bg-muted/20"
																	>
																		<div className="flex items-center justify-between px-2 py-1.5 gap-2">
																			<button
																				type="button"
																				onClick={() =>
																					toggleExpanded(category.id)
																				}
																				className="flex items-center gap-1 text-sm font-semibold flex-1 text-left"
																			>
																				<ChevronDown
																					className={`h-3.5 w-3.5 transition-transform ${
																						isOpen ? "" : "-rotate-90"
																					}`}
																				/>
																				<span className="truncate">
																					{category.courseName}
																				</span>
																				<span className="text-xs text-muted-foreground font-normal">
																					({selectedInCategory.length}/
																					{allIds.length})
																				</span>
																			</button>
																			<label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
																				<input
																					type="checkbox"
																					checked={isAllSelected}
																					disabled={allIds.length === 0}
																					onChange={(e) => {
																						const value = field.value || [];
																						if (e.target.checked) {
																							const newValue = Array.from(
																								new Set([...value, ...allIds]),
																							);
																							field.onChange(newValue);
																						} else {
																							field.onChange(
																								value.filter(
																									(id) => !allIds.includes(id),
																								),
																							);
																						}
																					}}
																					className="h-3.5 w-3.5 rounded border-gray-300"
																				/>
																				Pilih semua
																			</label>
																		</div>
																		{isOpen && (
																			<div className="px-3 pb-2 space-y-1 border-t">
																				{category.details.length === 0 ? (
																					<p className="text-xs text-muted-foreground py-1 italic">
																						Belum ada rekaman.
																					</p>
																				) : (
																					category.details.map((detail) => (
																						<label
																							key={detail.id}
																							className="flex items-start gap-2 py-1 text-sm hover:bg-muted/40 rounded px-1 cursor-pointer"
																						>
																							<input
																								type="checkbox"
																								checked={field.value?.includes(
																									detail.id,
																								)}
																								onChange={(e) => {
																									const value =
																										field.value || [];
																									if (e.target.checked) {
																										field.onChange([
																											...value,
																											detail.id,
																										]);
																									} else {
																										field.onChange(
																											value.filter(
																												(id) =>
																													id !== detail.id,
																											),
																										);
																									}
																								}}
																								className="h-3.5 w-3.5 rounded border-gray-300 mt-0.5"
																							/>
																							<span className="flex-1">
																								{detail.title}
																							</span>
																							<span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
																								{detail.courseType}
																							</span>
																						</label>
																					))
																				)}
																			</div>
																		)}
																	</div>
																);
															})
														)}
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2 p-4 sm:p-6 border-t bg-muted/50">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
