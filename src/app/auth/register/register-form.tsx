"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { AlertError } from "@/components/shared/alert-error";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
						router.push("/dashboard/profile");
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
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader className="space-y-3">
				<div className="flex justify-center">
					<div className="relative w-40 h-12">
						<Image
							src="/images/kelasinovatif-clean.png"
							alt="Kelas Inovatif Logo"
							fill
							className="object-contain"
							priority
						/>
					</div>
				</div>
				<div className="space-y-1.5">
					<CardTitle className="text-2xl">Register</CardTitle>
					<CardDescription>Create an account to get started</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmitWithAction} className="space-y-8">
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel htmlFor="email">Email</FormLabel>
										<FormControl>
											<Input
												id="email"
												placeholder="johndoe@mail.com"
												type="email"
												autoComplete="email"
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
									<FormItem className="space-y-1">
										<FormLabel htmlFor="password">Password</FormLabel>
										<FormControl>
											<PasswordInput
												id="password"
												autoComplete="new-password"
												{...field}
											/>
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
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Register
									</>
								) : (
									"Register"
								)}
							</Button>
						</div>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					Already have an account?{" "}
					<Link href="/auth/login" className="underline">
						Login
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
