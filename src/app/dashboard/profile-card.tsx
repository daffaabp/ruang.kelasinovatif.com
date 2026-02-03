"use client";

// import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { SessionData } from "@/lib/sessions";
// import { Crown, GraduationCap } from "lucide-react";

export function ProfileCard({ session }: { session: SessionData }) {
	return (
		<Card className="h-full">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Profil Pengguna</CardTitle>
						<CardDescription>Informasi detail akun Anda</CardDescription>
					</div>
					{/* <Badge className="bg-primary/10 text-primary hover:bg-primary/20 cursor-default">
						<Crown className="w-3 h-3 mr-1" />
						Premium Member
					</Badge> */}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* User Info */}
				<div className="grid gap-4">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Nama Lengkap:
						</p>
						<p className="text-sm">
							{session.profile?.firstName} {session.profile?.lastName}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Email:</p>
						<p className="text-sm">{session.email}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							No. Telepon:
						</p>
						<p className="text-sm">{session.profile?.phone || "-"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Institusi:
						</p>
						<p className="text-sm">{session.profile?.institution || "-"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Alamat:</p>
						<p className="text-sm">{session.profile?.address || "-"}</p>
					</div>
					{/* <div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Kota:</p>
						<p className="text-sm">{session.profile?.city || "-"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Provinsi:
						</p>
						<p className="text-sm">{session.profile?.province || "-"}</p>
					</div> */}
				</div>

				{/* Premium Access */}
				{/* <div>
					<p className="text-sm font-medium text-muted-foreground mb-3">
						Akses Premium:
					</p>
					<div className="grid grid-cols-2 gap-3">
						<Badge variant="secondary" className="justify-start">
							<GraduationCap className="w-3 h-3 mr-1" />
							Cursor
						</Badge>
						<Badge variant="secondary" className="justify-start">
							<GraduationCap className="w-3 h-3 mr-1" />
							Typeset
						</Badge>
						<Badge variant="secondary" className="justify-start">
							<GraduationCap className="w-3 h-3 mr-1" />
							Ebook-cursor
						</Badge>
						<Badge variant="secondary" className="justify-start">
							<GraduationCap className="w-3 h-3 mr-1" />
							Ebook-typeset
						</Badge>
					</div>
				</div> */}
			</CardContent>
		</Card>
	);
}
