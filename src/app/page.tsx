import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
	return (
		<Container variant="centered">
			<div className="w-full max-w-5xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">
						Selamat Datang di KelasInovatif
					</h1>
					<p className="text-muted-foreground">
						Memberdayakan Pendidikan Melalui Inovasi
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Link href="/auth/login" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>Pembelajaran Interaktif</CardTitle>
								<CardDescription>
									Konten pendidikan yang menarik
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Akses pelajaran interaktif, kuis, dan materi pembelajaran yang
									dirancang untuk meningkatkan pengalaman belajar Anda.
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/auth/forgot-password" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>Pantau Progres</CardTitle>
								<CardDescription>
									Pantau perjalanan belajar Anda
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Lacak kemajuan Anda, lihat pencapaian, dan tetap termotivasi
									dengan analitik pembelajaran kami yang komprehensif.
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/dashboard" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>Komunitas Belajar</CardTitle>
								<CardDescription>Terhubung dan berkolaborasi</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Bergabung dengan komunitas pembelajar kami yang aktif, berbagi
									pengetahuan, dan berpartisipasi dalam diskusi grup.
								</p>
							</CardContent>
						</Card>
					</Link>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Button asChild size="lg">
						<Link href="/auth/login">Mulai Belajar</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/auth/register">Daftar Sekarang</Link>
					</Button>
					<Button asChild variant="secondary" size="lg">
						<Link href="/dashboard">Kursus Saya</Link>
					</Button>
				</div>
			</div>
		</Container>
	);
}
