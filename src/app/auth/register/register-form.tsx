"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { AlertError } from "@/components/shared/alert-error";
import { PasswordInput } from "@/components/shared/password-input";
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { registerAction } from "./register-actions";
import { RegisterSuccess } from "./register-succcess";
import { registerSchema } from "./register-validations";

export function RegisterForm() {
	const router = useRouter();
	const [isSuccess, setIsSuccess] = useState(false);
	const { form, handleSubmitWithAction } = useHookFormAction(
		registerAction,
		zodResolver(registerSchema),
		{
			actionProps: {
				onSuccess: async ({ data }) => {
					if (data?.success) {
						setIsSuccess(true);
						await new Promise((resolve) => setTimeout(resolve, 3000));
						router.push("/dashboard");
					}
				},
				onError: ({ error }) => {
					form.resetField("password");
					if (typeof error?.serverError === "string") {
						toast.error(error.serverError);
					}
				},
			},
			formProps: {
				defaultValues: {
					email: "",
					password: "",
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

	if (isSuccess) {
		return <RegisterSuccess />;
	}

	return (
		<div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.005] duration-500">
			{/* Gradient top strip */}
			<div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

			{/* Corner decoration */}
			<div className="absolute top-1.5 right-0 w-36 h-36 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full pointer-events-none" />
			<div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-emerald-50/60 to-transparent rounded-tr-full pointer-events-none" />

			{/* Dot pattern corner */}
			<div
				className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.06] pointer-events-none"
				style={{
					backgroundImage: "radial-gradient(circle, #064E3B 1.5px, transparent 1.5px)",
					backgroundSize: "10px 10px",
				}}
			/>

			<div className="p-8 md:p-10">
				<div className="flex flex-col items-center gap-2 mb-7">
					<Image
						src="/images/logo_kelas_inovatif.webp"
						alt="KelasInovatif Logo"
						width={240}
						height={60}
						className="h-11 w-auto object-contain"
						priority
					/>
					<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-semibold text-emerald-700">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						Bergabung ke Komunitas
					</span>
				</div>
				<div className="text-center mb-7">
					<h1 className="text-2xl font-bold text-gray-900 mb-1.5">Daftar</h1>
					<p className="text-gray-400 text-sm">
						Buat akun untuk memulai pembelajaran
					</p>
				</div>
			<Form {...form}>
				<form onSubmit={handleSubmitWithAction} className="space-y-5">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="block text-sm font-semibold text-gray-700 mb-1.5">
									Email
								</FormLabel>
								<FormControl>
									<Input
										placeholder="johndoe@mail.com"
										type="email"
										autoComplete="email"
										className="block w-full px-4 py-3 rounded-xl border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200 ease-in-out bg-gray-50/50 focus:bg-white"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="block text-sm font-semibold text-gray-700 mb-1.5">
									Kata Sandi
								</FormLabel>
								<FormControl>
									<div className="relative">
										<PasswordInput
											autoComplete="new-password"
											className="block w-full px-4 py-3 rounded-xl border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-primary sm:text-sm transition-colors duration-200 ease-in-out bg-gray-50/50 focus:bg-white pr-10"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<AlertError
						show={!!form.formState.errors.root}
						message={form.formState.errors.root?.message}
						onClose={() => form.clearErrors("root")}
					/>
					<div className="pt-2">
						<Button
							type="submit"
							disabled={form.formState.isSubmitting}
							className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-0.5"
						>
							{form.formState.isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Daftar
								</>
							) : (
								"Daftar"
							)}
						</Button>
					</div>
				</form>
			</Form>
			<div className="mt-8 text-center">
				<p className="text-sm text-gray-600">
					Sudah punya akun?
					<Link
						href="/auth/login"
						className="font-semibold text-primary hover:text-primary-hover transition-colors ml-1"
					>
						Masuk
					</Link>
				</p>
			</div>
			</div>
		</div>
	);
}
