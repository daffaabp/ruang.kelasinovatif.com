

import Link from "next/link";
import Image from "next/image";

export default function Home() {
	return (
		<div className="bg-deep-green dark:bg-background-dark font-sans text-white dark:text-slate-100 antialiased min-h-screen flex flex-col transition-colors duration-300">
			<nav className="w-full fixed top-0 z-50 transition-all duration-300 bg-deep-green/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-white/10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-20">
						<div className="flex items-center gap-2">
							<Image
								src="/images/logo_kelas_inovatif.webp"
								alt="Kelas Inovatif Logo"
								width={190}
								height={45}
								className="h-10 w-auto object-contain"
								priority
							/>
						</div>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-8">
								<Link
									href="/"
									className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
								>
									Beranda
								</Link>
								<Link
									href="#"
									className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
								>
									Tentang Kami
								</Link>
								<Link
									href="/auth/login"
									className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-white/10"
								>
									Masuk
								</Link>
							</div>
						</div>
						<div className="-mr-2 flex md:hidden">
							<button
								type="button"
								className="bg-transparent inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
							>
								<span className="sr-only">Open main menu</span>
								<span className="material-icons-round">menu</span>
							</button>
						</div>
					</div>
				</div>
			</nav>
			<section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-hidden min-h-screen flex flex-col justify-center">
				<div className="absolute top-0 left-0 w-full h-full bg-deep-green dark:bg-background-dark z-0" />
				<div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-primary/20 rounded-full blur-3xl z-0 animate-pulse" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-900/40 rounded-full blur-3xl z-0" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
					<h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
						Selamat Datang di <br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">
							KelasInovatif
						</span>
					</h1>
					<p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-emerald-100/80 font-light">
						Memberdayakan Pendidikan Melalui Inovasi. Platform belajar modern
						untuk masa depan yang lebih cerah.
					</p>
					<div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
						<div className="glass-card p-6 rounded-xl shadow-lg hover:translate-y-[-5px] transition-all duration-300 group">
							<div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
								<span className="material-icons-round text-deep-green dark:text-emerald-400 text-2xl">
									touch_app
								</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
								Pembelajaran Interaktif
							</h3>
							<p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
								Konten pendidikan yang menarik
							</p>
							<p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
								Akses pelajaran interaktif, kuis, dan materi pembelajaran yang
								dirancang untuk meningkatkan pengalaman belajar Anda.
							</p>
						</div>
						<div className="glass-card p-6 rounded-xl shadow-lg hover:translate-y-[-5px] transition-all duration-300 group relative overflow-hidden">
							<div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-primary/10" />
							<div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
								<span className="material-icons-round text-deep-green dark:text-emerald-400 text-2xl">
									trending_up
								</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
								Pantau Progres
							</h3>
							<p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
								Pantau perjalanan belajar Anda
							</p>
							<p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
								Lacak kemajuan Anda, lihat pencapaian, dan tetap termotivasi
								dengan analitik pembelajaran kami.
							</p>
						</div>
						<div className="glass-card p-6 rounded-xl shadow-lg hover:translate-y-[-5px] transition-all duration-300 group">
							<div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
								<span className="material-icons-round text-deep-green dark:text-emerald-400 text-2xl">
									groups
								</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
								Komunitas Belajar
							</h3>
							<p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
								Terhubung dan berkolaborasi
							</p>
							<p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs">
								Bergabung dengan komunitas pembelajar kami yang aktif, berbagi
								pengetahuan, dan berdiskusi.
							</p>
						</div>
					</div>
					<div className="mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 items-center">
						<Link
							href="/auth/register"
							className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 group text-sm"
						>
							Mulai Belajar
							<span className="material-icons-round group-hover:translate-x-1 transition-transform text-base">
								arrow_forward
							</span>
						</Link>
						<Link
							href="/auth/register"
							className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-deep-green font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 border border-transparent text-sm"
						>
							Daftar Sekarang
						</Link>
						<Link
							href="/dashboard"
							className="w-full sm:w-auto px-6 py-3 bg-emerald-900/40 hover:bg-emerald-800/60 dark:bg-white/10 dark:hover:bg-white/20 text-emerald-100 dark:text-white font-semibold rounded-xl backdrop-blur-md transition-all border border-emerald-500/30 flex items-center justify-center gap-2 text-sm"
						>
							<span className="material-icons-round text-base">school</span>
							Kursus Saya
						</Link>
					</div>
				</div>
			</section>
			<div className="mt-auto w-full h-24 bg-gradient-to-t from-emerald-900/20 to-transparent dark:from-black/40 pointer-events-none" />
		</div>
	);
}
