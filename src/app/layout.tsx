import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
			<body className={inter.className}>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
