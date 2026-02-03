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
		<div className="flex justify-center mt-8">
			<Button
				className="bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm"
				size="default"
				onClick={() => window.open(whatsappUrl, "_blank")}
			>
				<MessageCircle className="h-4 w-4 mr-2" />
				Hubungi Admin via WhatsApp
			</Button>
		</div>
	);
}
