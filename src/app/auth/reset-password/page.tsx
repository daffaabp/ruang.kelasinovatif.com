import { Container } from "@/components/shared/container";
import { validatePasswordResetToken } from "@/lib/token-utils";
import type { Metadata } from "next";
import { ResetForm } from "./reset-form";
import { TokenError } from "./token-error";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Reset your password",
};

interface PageProps {
	searchParams: Promise<{
		token?: string;
		email?: string;
	}>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
	const { token, email } = await searchParams;

	// Validate required params
	if (!token || !email) {
		return (
			<Container variant="centered">
				<TokenError message="Missing reset password information" />
			</Container>
		);
	}

	// Validate token on server
	const validToken = await validatePasswordResetToken(token, email);

	if (!validToken) {
		return (
			<Container variant="centered">
				<TokenError message="Invalid or expired reset link" />
			</Container>
		);
	}

	return (
		<Container variant="centered">
			<ResetForm email={email} token={token} />
		</Container>
	);
}
