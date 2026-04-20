"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AlertError } from "@/components/shared/alert-error";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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
import { profileAction } from "@/app/dashboard/profile/profile-actions";
import { profileSchema } from "@/app/dashboard/profile/profile-validations";

export function ProfileCompletionDialog() {
	const router = useRouter();

	const { form, handleSubmitWithAction } = useHookFormAction(
		profileAction,
		zodResolver(profileSchema),
		{
			actionProps: {
				onSuccess: async ({ data }) => {
					if (data?.success) {
						toast.success("Profil berhasil dilengkapi! Selamat datang 🎉");
						router.refresh();
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
					firstName: "",
					lastName: "",
					phone: "",
					institution: "",
					address: "",
					city: "",
					province: "",
				},
			},
			errorMapProps: { joinBy: " dan " },
		},
	);

	return (
		<Dialog
			open={true}
			onOpenChange={() => {
				// Dialog tidak bisa ditutup sampai profil dilengkapi
			}}
		>
			<DialogContent
				className="max-w-lg max-h-[90vh] overflow-y-auto"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				hideCloseButton
			>
				{/* Header */}
				<DialogHeader className="pb-2">
					<div className="flex items-center gap-3 mb-1">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<UserCircle2 className="h-5 w-5 text-primary" />
						</div>
						<div>
							<DialogTitle className="text-lg font-bold text-slate-800">
								Lengkapi Profil Anda
							</DialogTitle>
							<DialogDescription className="text-sm text-slate-500 mt-0.5">
								Data ini diperlukan sebelum Anda dapat menggunakan layanan.
							</DialogDescription>
						</div>
					</div>
					<div className="h-1 w-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={handleSubmitWithAction} className="space-y-4 pt-1">
						{/* Nama */}
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold text-slate-700">
											Nama Depan <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nama depan"
												className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
												{...field}
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
										<FormLabel className="text-sm font-semibold text-slate-700">
											Nama Belakang <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nama belakang"
												className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Telepon */}
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold text-slate-700">
										No. Telepon / WhatsApp <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="08xxxxxxxxxx"
											type="tel"
											className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Institusi */}
						<FormField
							control={form.control}
							name="institution"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold text-slate-700">
										Institusi / Sekolah <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Nama sekolah atau institusi"
											className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Alamat */}
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-semibold text-slate-700">
										Alamat <span className="text-red-500">*</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Alamat lengkap"
											className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Kota & Provinsi */}
						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-semibold text-slate-700">
											Kota / Kabupaten <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nama kota"
												className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
												{...field}
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
										<FormLabel className="text-sm font-semibold text-slate-700">
											Provinsi <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Nama provinsi"
												className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:border-primary focus:ring-primary"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<AlertError
							show={!!form.formState.errors.root}
							message={form.formState.errors.root?.message}
							onClose={() => form.clearErrors("root")}
						/>

						<div className="pt-2">
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Menyimpan...
									</>
								) : (
									"Simpan & Lanjutkan"
								)}
							</Button>
							<p className="text-center text-xs text-slate-400 mt-3">
								Data Anda aman dan tidak akan dibagikan kepada pihak ketiga.
							</p>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
