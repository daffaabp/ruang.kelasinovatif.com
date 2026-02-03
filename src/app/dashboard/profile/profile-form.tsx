"use client";

import { AlertError } from "@/components/shared/alert-error";
import { Button } from "@/components/ui/button";
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
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { profileAction } from "./profile-actions";
import { profileSchema } from "./profile-validations";

interface ProfileData {
	firstName: string;
	lastName: string;
	phone: string;
	institution: string;
	address: string;
	city: string;
	province: string;
}

interface ProfileFormProps {
	initialData: ProfileData | null;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
	const { form, handleSubmitWithAction } = useHookFormAction(
		profileAction,
		zodResolver(profileSchema),
		{
			actionProps: {
				onSuccess: async ({ data }) => {
					if (data?.success) {
						toast.success(data.message);
					}
				},
				onError: ({ error }) => {
					if (typeof error?.serverError === "string") {
						toast.error(error.serverError);
					}
				},
			},
			formProps: {
				defaultValues: initialData ?? {
					firstName: "",
					lastName: "",
					phone: "",
					institution: "",
					address: "",
					city: "",
					province: "",
				},
			},
			errorMapProps: {
				joinBy: " and ",
			},
		},
	);

	useEffect(() => {
		const subscription = form.watch(() => {
			form.clearErrors("root");
		});

		return () => subscription.unsubscribe();
	}, [form]);

	return (
		<div className="rounded-md border bg-white">
			<Form {...form}>
				<form onSubmit={handleSubmitWithAction} className="p-6 space-y-8">
					<div className="grid gap-6">
						{/* Personal Information */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold tracking-tight">
								Informasi Pribadi
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Depan</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama depan"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Belakang</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama belakang"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Institution Information */}
						<div className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>No. Telepon</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nomor telepon"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="institution"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Institusi</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama institusi"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Address Information */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Alamat</FormLabel>
										<FormControl>
											<Input
												placeholder="Masukkan alamat lengkap"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Kota</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama kota"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="province"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Provinsi</FormLabel>
											<FormControl>
												<Input
													placeholder="Masukkan nama provinsi"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>

					<AlertError
						show={!!form.formState.errors.root}
						message={form.formState.errors.root?.message}
						onClose={() => form.clearErrors("root")}
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
		</div>
	);
}
