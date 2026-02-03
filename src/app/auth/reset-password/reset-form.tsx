"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { resetSchema } from "./reset-validations";
import { resetAction } from "./reset-actions";
import { useEffect, useState } from "react";
import { ResetSuccess } from "./reset-succcess";
import { AlertError } from "@/components/shared/alert-error";
import { PasswordInput } from "@/components/shared/password-input";

interface ResetFormProps {
	email: string;
	token: string;
}

export function ResetForm({ email, token }: ResetFormProps) {
	const [isSuccess, setIsSuccess] = useState(false);

	const { form, handleSubmitWithAction } = useHookFormAction(
		resetAction,
		zodResolver(resetSchema),
		{
			actionProps: {
				onSuccess: async () => {
					setIsSuccess(true);
				},
				onError: ({ error }) => {
					form.resetField("password");
					form.resetField("confirmPassword");
					if (typeof error?.serverError === "string") {
						toast.error(error.serverError);
					}
				},
			},
			formProps: {
				defaultValues: {
					email,
					token,
					password: "",
					confirmPassword: "",
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
		return <ResetSuccess />;
	}

	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader>
				<CardTitle className="text-2xl">Reset Password</CardTitle>
				<CardDescription>Enter your new password</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmitWithAction} className="space-y-8">
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel htmlFor="password">New Password</FormLabel>
										<FormControl>
											<PasswordInput
												id="password"
												autoComplete="new-password"
												placeholder="Enter your new password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem className="space-y-1">
										<FormLabel htmlFor="confirmPassword">
											Confirm Password
										</FormLabel>
										<FormControl>
											<PasswordInput
												id="confirmPassword"
												autoComplete="new-password"
												placeholder="Confirm your new password"
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
										Reset Password
									</>
								) : (
									"Reset Password"
								)}
							</Button>
						</div>
					</form>
				</Form>
				<div className="mt-4 text-center text-sm">
					Remember your password?{" "}
					<Link href="/auth/login" className="underline">
						Login
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
