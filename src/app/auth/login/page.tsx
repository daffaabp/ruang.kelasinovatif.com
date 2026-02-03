import { Container } from "@/components/shared/container";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
	title: "Login",
	description: "Login to your account",
};

export default function LoginPage() {
	return (
		<Container variant="centered">
			<LoginForm />
		</Container>
	);
}
