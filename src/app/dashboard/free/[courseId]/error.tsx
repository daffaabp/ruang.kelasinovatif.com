"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-2xl font-bold mb-4">Terjadi Kesalahan</h2>
				<p className="text-gray-600 mb-6">
					Maaf, terjadi kesalahan saat memuat konten. Silakan coba lagi.
				</p>
				<Button onClick={() => reset()} variant="outline">
					Coba Lagi
				</Button>
			</div>
		</div>
	);
}
