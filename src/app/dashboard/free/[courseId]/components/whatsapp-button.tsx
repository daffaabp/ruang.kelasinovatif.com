"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
	courseTitle: string;
}

export default function WhatsAppButton({ courseTitle }: WhatsAppButtonProps) {
	const phoneNumber = "6285712208535"; // Ganti dengan nomor WhatsApp admin
	const message = `Halo, saya ingin bertanya tentang materi "${courseTitle}"`;

	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
		message,
	)}`;

	return (
		<div className="flex flex-col items-center mt-8 space-y-2">
			<p className="text-sm text-muted-foreground">
				Jika butuh bantuan, silahkan hubungi tim e-learning Kelas Inovatif
			</p>
			<Button
				className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm"
				size="default"
				onClick={() => window.open(whatsappUrl, "_blank")}
			>
				<MessageCircle className="h-4 w-4 mr-2" />
				Klik WA Disini
			</Button>
		</div>
	);
}
