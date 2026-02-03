"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { Input } from "@/components/ui/input";
import { forgotSchema } from "./forgot-validations";
import { forgotAction } from "./forgot-actions";
import { AlertError } from "@/components/shared/alert-error";
import { ForgotSuccess } from "./forgot-succcess";

export function ForgotForm() {
	const [isSuccess, setIsSuccess] = useState(false);
	const { form, handleSubmitWithAction } = useHookFormAction(
		forgotAction,
		zodResolver(forgotSchema),
		{
			actionProps: {
				onSuccess: ({ data }) => {
					if (data?.success) {
						setIsSuccess(true);
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
					email: "",
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
		return <ForgotSuccess />;
	}

	return (
		<Card className="mx-auto max-w-sm w-full">
			<CardHeader>
				<CardTitle className="text-2xl">Forgot Password</CardTitle>
				<CardDescription>
					Enter your email to reset your password
				</CardDescription>
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
							<AlertError
								show={!!form.formState.errors.root}
								message={form.formState.errors.root?.message}
								onClose={() => form.clearErrors("root")}
							/>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Send Reset Email
									</>
								) : (
									"Send Reset Email"
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
