import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "KelasInovatif",
		template: "%s | KelasInovatif",
	},
	description: "Platform Pembelajaran AI Pertama di Indonesia",
	icons: {
		icon: [
			{
				url: "/images/kelasinovatif-clean.png",
				type: "image/png",
			},
		],
		shortcut: ["/images/kelasinovatif-clean.png"],
		apple: [
			{
				url: "/images/kelasinovatif-clean.png",
				type: "image/png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<link
					href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
					rel="stylesheet"
				/>
			</head>
			<body className={plusJakartaSans.className}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
