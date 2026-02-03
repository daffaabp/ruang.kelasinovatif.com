import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
	title: "Daftar",
	description: "Buat akun untuk memulai",
};

export default function RegisterPage() {
	return (
		<div className="bg-background-dark font-sans text-slate-800 antialiased min-h-screen flex items-center justify-center relative overflow-hidden">
			<div className="absolute inset-0 bg-background-dark z-0" />
			<div className="absolute inset-0 geometric-pattern z-0 opacity-50 pointer-events-none" />
			<div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-900/40 rounded-full blur-[100px] mix-blend-screen animate-pulse z-0" />
			<div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen z-0" />
			<svg
				className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none z-0"
				preserveAspectRatio="none"
				viewBox="0 0 100 100"
			>
				<path d="M100 0 L0 100 L100 100 Z" fill="white" />
			</svg>
			<main className="w-full max-w-md px-4 relative z-10">
				<RegisterForm />
				<div className="mt-8 text-center">
					<p className="text-emerald-100/40 text-xs">
						© 2024 KelasInovatif. All rights reserved.
					</p>
				</div>
			</main>
		</div>
	);
}
