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
	firstName: string | null;
	lastName: string | null;
	phone: string | null;
	institution: string | null;
	address: string | null;
	city: string | null;
	province: string | null;
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
				defaultValues: {
					firstName: initialData?.firstName ?? "",
					lastName: initialData?.lastName ?? "",
					phone: initialData?.phone ?? "",
					institution: initialData?.institution ?? "",
					address: initialData?.address ?? "",
					city: initialData?.city ?? "",
					province: initialData?.province ?? "",
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
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4">
			<div className="p-4 lg:p-5">
				<Form {...form}>
					<form onSubmit={handleSubmitWithAction} className="space-y-5">
						<div>
							<div className="flex items-center gap-2 mb-3">
								<span className="material-icons-round text-primary">badge</span>
								<h4 className="text-base font-bold text-slate-800">
									Informasi Pribadi
								</h4>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-slate-700">
													Nama Depan
												</FormLabel>
												<FormControl>
													<div className="relative">
														<Input
															placeholder="Nama Depan"
															className="h-10 w-full px-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
															{...field}
															value={field.value || ""}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-slate-700">
													Nama Belakang
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Nama Belakang"
														className="h-10 w-full px-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-slate-700">
													No. Telepon
												</FormLabel>
												<FormControl>
													<div className="relative">
														<span className="absolute left-3 top-2 text-slate-400 material-icons-round text-[20px]">
															call
														</span>
														<Input
															placeholder="08..."
															className="h-10 w-full pl-10 pr-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
															{...field}
															value={field.value || ""}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="institution"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-slate-700">
													Institusi / Sekolah
												</FormLabel>
												<FormControl>
													<div className="relative">
														<span className="absolute left-3 top-2 text-slate-400 material-icons-round text-[20px]">
															school
														</span>
														<Input
															placeholder="Nama Sekolah / Institusi"
															className="h-10 w-full pl-10 pr-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
															{...field}
															value={field.value || ""}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>
						<div>
							<div className="h-px w-full bg-slate-100 mb-3"></div>
							<div className="flex items-center gap-2 mb-3">
								<span className="material-icons-round text-primary">
									location_on
								</span>
								<h4 className="text-base font-bold text-slate-800">
									Alamat Lengkap
								</h4>
							</div>
							<div className="space-y-4">
								<div className="space-y-2">
									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-slate-700">
													Alamat
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Alamat lengkap..."
														className="h-10 w-full px-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
														{...field}
														value={field.value || ""}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<FormField
											control={form.control}
											name="city"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-slate-700">
														Kota / Kabupaten
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Nama Kota"
															className="h-10 w-full px-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
															{...field}
															value={field.value || ""}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="space-y-2">
										<FormField
											control={form.control}
											name="province"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-slate-700">
														Provinsi
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Nama Provinsi"
															className="h-10 w-full px-3 rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 transition-all duration-200 placeholder-slate-400 focus:border-primary focus:ring-primary"
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
						</div>

						<AlertError
							show={!!form.formState.errors.root}
							message={form.formState.errors.root?.message}
							onClose={() => form.clearErrors("root")}
						/>

						<div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:-mx-5 lg:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<Button
								type="button"
								variant="outline"
								className="h-10 px-4 text-slate-600 font-semibold rounded-lg border-slate-200 hover:bg-slate-50 transition-all"
							>
								Ubah Password
							</Button>
							<div className="flex gap-2">
								<Button
									type="button"
									variant="ghost"
									className="h-10 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all"
									onClick={() => form.reset()}
								>
									Batal
								</Button>
								<Button
									type="submit"
									disabled={form.formState.isSubmitting}
									className="h-10 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-md shadow-primary/20 transition-all flex items-center gap-2"
								>
									{form.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Menyimpan...
										</>
									) : (
										<>
											<span className="material-icons-round text-lg">save</span>
											Simpan Perubahan
										</>
									)}
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
