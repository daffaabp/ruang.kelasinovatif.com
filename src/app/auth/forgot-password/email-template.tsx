interface EmailTemplateProps {
	resetLink: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
	resetLink,
}) => (
	<div>
		<h1>Reset Your Password</h1>
		<p>
			You requested to reset your password. Click the link below to set a new
			password:
		</p>
		<a
			href={resetLink}
			style={{ color: "#0070f3", textDecoration: "underline" }}
		>
			Reset Password
		</a>
		<p>
			If you did not request this, please ignore this email. The link will
			expire in 24 hours.
		</p>
		<p>Best regards,</p>
		<p>KelasInovatif Team</p>
	</div>
);
