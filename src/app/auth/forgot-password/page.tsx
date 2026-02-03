import { Container } from "@/components/shared/container";
import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Reset your password",
};

export default function ForgotPasswordPage() {
	return (
		<Container variant="centered">
			<ForgotForm />
		</Container>
	);
}
