import { Container } from "@/components/shared/container";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
	title: "Register",
	description: "Create an account to get started",
};

export default function RegisterPage() {
	return (
		<Container variant="centered">
			<RegisterForm />
		</Container>
	);
}
