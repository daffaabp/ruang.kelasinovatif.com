"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const features = [
	{
		icon: "touch_app",
		title: "Pembelajaran Interaktif",
		subtitle: "Konten akademik berbasis AI",
		description:
			"Akses materi interaktif, kuis cerdas, dan modul pembelajaran yang dirancang AI untuk pengalaman belajar yang lebih efektif.",
	},
	{
		icon: "trending_up",
		title: "Pantau Progres",
		subtitle: "Lacak perjalanan belajarmu",
		description:
			"Lihat pencapaianmu secara real-time, ukur perkembangan, dan tetap termotivasi dengan analitik pembelajaran personal.",
	},
	{
		icon: "groups",
		title: "Komunitas Belajar",
		subtitle: "Terhubung dan bertumbuh bersama",
		description:
			"Bergabung dengan ribuan pelajar aktif, berdiskusi, berbagi ilmu, dan saling mendukung dalam forum KelasInovatif.",
	},
];

export default function Home() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="h-screen flex flex-col bg-[#0a2e26] font-sans text-white antialiased overflow-hidden">
			{/* ── NAVBAR ── */}
			<nav className="shrink-0 w-full z-50 bg-[#0a2e26]/90 backdrop-blur-md border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-14">
						<Link href="/">
							<Image
								src="/images/logo_kelas_inovatif_light.webp"
								alt="KelasInovatif"
								width={150}
								height={36}
								className="h-8 w-auto object-contain"
								priority
							/>
						</Link>

						{/* Desktop */}
						<div className="hidden md:flex items-center gap-3">
							<Link
								href="/auth/login"
								className="px-4 py-2 text-sm font-medium text-emerald-100/75 hover:text-white transition-colors"
							>
								Masuk
							</Link>
							<Link
								href="/auth/register"
								className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
							>
								Bergabung Sekarang
							</Link>
						</div>

						{/* Mobile */}
						<button
							type="button"
							aria-label="Menu"
							onClick={() => setMobileOpen((v) => !v)}
							className="md:hidden p-2 rounded-lg text-emerald-200 hover:bg-white/10 transition-colors"
						>
							<span className="material-icons-round">
								{mobileOpen ? "close" : "menu"}
							</span>
						</button>
					</div>
				</div>

				{mobileOpen && (
					<div className="md:hidden border-t border-white/10 bg-[#0a2e26] px-4 pb-4 pt-3 flex flex-col gap-2">
						<Link
							href="/auth/login"
							onClick={() => setMobileOpen(false)}
							className="w-full text-center py-2.5 text-sm font-medium text-emerald-100/75 hover:text-white"
						>
							Masuk
						</Link>
						<Link
							href="/auth/register"
							onClick={() => setMobileOpen(false)}
							className="w-full text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg"
						>
							Bergabung Sekarang
						</Link>
					</div>
				)}
			</nav>

			{/* ── HERO + CARDS dalam satu frame ── */}
			<main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8">
				{/* Background decorations */}
				<div className="absolute inset-0 geometric-pattern opacity-25 z-0" />
				<div className="absolute top-[-5%] right-[-10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[100px] z-0" />
				<div className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] bg-emerald-900/35 rounded-full blur-[90px] z-0" />

				<div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-5">

					{/* Label */}
					<p className="text-xs font-bold tracking-[0.2em] text-emerald-400/80 uppercase">
						Platform AI untuk Akademik Indonesia
					</p>

					{/* Headline */}
					<h1 className="text-3xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.2] text-center">
						Selamat Datang di
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300">
							Komunitas Kelas Inovatif
						</span>
					</h1>

					{/* Subtitle */}
					<p className="text-sm md:text-base text-emerald-100/60 leading-relaxed text-center max-w-xl">
						Belajar bersama ribuan pelajar Indonesia. Akses materi berkualitas,
						didukung AI, dan tumbuh dalam komunitas yang saling menginspirasi.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
						<Link
							href="/auth/register"
							className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-xl shadow-emerald-900/40 transition-all hover:scale-105 flex items-center justify-center gap-2 group text-sm"
						>
							Bergabung ke Komunitas
							<span className="material-icons-round text-base group-hover:translate-x-1 transition-transform">
								arrow_forward
							</span>
						</Link>
						<Link
							href="/auth/login"
							className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all hover:scale-105 text-sm text-center"
						>
							Sudah anggota? Masuk
						</Link>
					</div>

					{/* ── Feature cards ── */}
					<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
						{features.map((feature, i) => (
							<div
								key={feature.title}
								className="group relative rounded-2xl p-5 shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/10 bg-white/95"
							>
								{/* Accent strip top */}
								<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 rounded-t-2xl" />

								{/* Corner decoration */}
								<div className="absolute top-1 right-0 w-24 h-24 bg-emerald-500/8 rounded-bl-full rounded-tr-2xl" />

								{/* Subtle dot pattern */}
								{i === 1 && (
									<div
										className="absolute bottom-0 left-0 w-full h-16 opacity-[0.04]"
										style={{
											backgroundImage:
												"radial-gradient(circle, #064E3B 1px, transparent 1px)",
											backgroundSize: "12px 12px",
										}}
									/>
								)}

								<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm">
									<span className="material-icons-round text-emerald-700 text-xl">
										{feature.icon}
									</span>
								</div>
								<h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
									{feature.title}
								</h3>
								<p className="text-[11px] font-semibold text-emerald-600 mb-2">
									{feature.subtitle}
								</p>
								<p className="text-[11px] text-gray-500 leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
