"use client";

import { Button } from "@/components/ui/button";
import type { CourseType } from "@prisma/client";
import { ChevronLeft, FileText, FileType, Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import WhatsAppButton from "./whatsapp-button";
import YouTubePlayer, { getYouTubeId } from "./youtube-player";

interface CourseDetailProps {
	course: {
		id: string;
		title: string;
		description: string;
		courseType: CourseType;
		videoUrl?: string | null;
		downloadUrl?: string | null;
		course: {
			id: string;
			courseName: string;
		};
	};
}

function getGoogleDriveFileId(url: string): string | null {
	// Format: https://drive.google.com/file/d/FILE_ID/view
	const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
	return match ? match[1] : null;
}

function getGoogleDrivePreviewUrl(fileId: string): string {
	return `https://drive.google.com/file/d/${fileId}/preview`;
}

function getFileType(url: string): "pdf" | "ppt" | "doc" | "other" {
	if (!url) return "other";

	// Handle Google Drive links
	if (url.includes("drive.google.com")) {
		// Untuk Google Drive, kita return pdf sebagai default
		// karena kebanyakan dokumen bisa di-preview sebagai PDF
		return "pdf";
	}

	// Handle direct links atau URL lainnya
	const extension = url.split(/[#?]/)[0].split(".").pop()?.toLowerCase();

	switch (extension) {
		case "pdf":
			return "pdf";
		case "ppt":
		case "pptx":
			return "ppt";
		case "doc":
		case "docx":
			return "doc";
		default:
			return "other";
	}
}

function getPreviewContent(type: "pdf" | "ppt" | "doc" | "other") {
	switch (type) {
		case "pdf":
			return {
				icon: <FileText className="w-16 h-16 text-red-500" />,
				label: "PDF Document",
				bgColor: "bg-red-50",
			};
		case "ppt":
			return {
				icon: <Presentation className="w-16 h-16 text-orange-500" />,
				label: "PowerPoint Presentation",
				bgColor: "bg-orange-50",
			};
		case "doc":
			return {
				icon: <FileText className="w-16 h-16 text-blue-500" />,
				label: "Word Document",
				bgColor: "bg-blue-50",
			};
		default:
			return {
				icon: <FileType className="w-16 h-16 text-gray-500" />,
				label: "Document",
				bgColor: "bg-gray-50",
			};
	}
}

export default function CourseDetail({ course }: CourseDetailProps) {
	const router = useRouter();
	const isGoogleDriveVideo =
		course.videoUrl?.includes("drive.google.com") || false;
	const videoId = !isGoogleDriveVideo
		? getYouTubeId(course.videoUrl || "")
		: null;
	const googleDriveFileId = isGoogleDriveVideo
		? getGoogleDriveFileId(course.videoUrl || "")
		: null;

	const fileType = course.downloadUrl
		? getFileType(course.downloadUrl)
		: "other";
	const isGoogleDriveDoc = course.downloadUrl?.includes("drive.google.com");
	const docDriveFileId = isGoogleDriveDoc
		? getGoogleDriveFileId(course.downloadUrl || "")
		: null;

	return (
		<article className="space-y-4">
			{/* Navigation */}
			<nav className="flex items-center">
				<Button
					variant="ghost"
					size="sm"
					className="hover:bg-accent"
					onClick={() => router.back()}
				>
					<ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
					Kembali
				</Button>
			</nav>

			{/* Header */}
			<header className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
				<p className="text-muted-foreground">{course.course.courseName}</p>
			</header>

			{/* Content */}
			<div className="space-y-6">
				{/* Video Content */}
				{course.courseType === "VIDEO" && (
					<section className="overflow-hidden rounded-lg bg-accent/10">
						{!isGoogleDriveVideo && videoId ? (
							// Tampilkan YouTube Player
							<div className="aspect-video">
								<YouTubePlayer videoId={videoId} title={course.title} />
							</div>
						) : isGoogleDriveVideo && googleDriveFileId ? (
							// Tampilkan Google Drive Video
							<div className="aspect-video">
								<iframe
									src={`https://drive.google.com/file/d/${googleDriveFileId}/preview`}
									className="w-full h-full"
									allow="autoplay"
									allowFullScreen
									title={`Video: ${course.title}`}
								/>
							</div>
						) : (
							<div className="aspect-video flex items-center justify-center">
								<p className="text-muted-foreground">URL video tidak valid</p>
							</div>
						)}
					</section>
				)}

				{/* E-Book Content */}
				{course.courseType === "EBOOK" && course.downloadUrl && (
					<section className="space-y-4">
						{/* Preview Card */}
						<div
							className={`rounded-lg overflow-hidden ${getPreviewContent(fileType).bgColor}`}
						>
							{isGoogleDriveDoc && docDriveFileId ? (
								<div className="aspect-[16/10]">
									<iframe
										src={getGoogleDrivePreviewUrl(docDriveFileId)}
										className="w-full h-full min-h-[250px]"
										allow="autoplay"
										allowFullScreen
										title={`Preview: ${course.title}`}
									/>
								</div>
							) : (
								<div className="p-6">
									<div className="flex flex-col items-center justify-center space-y-3">
										{getPreviewContent(fileType).icon}
										<p className="text-sm font-medium text-muted-foreground">
											{getPreviewContent(fileType).label}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Download Button */}
						<div className="flex justify-center sm:justify-start">
							<a
								href={course.downloadUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									role="img"
									aria-label="Download icon"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								Unduh E-Book
							</a>
						</div>
					</section>
				)}

				{/* Description */}
				<section className="space-y-3">
					<h2 className="text-xl font-semibold tracking-tight">Deskripsi</h2>
					<div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
						{course.description}
					</div>
				</section>

				{/* WhatsApp Button */}
				<WhatsAppButton courseTitle={course.title} />
			</div>
		</article>
	);
}
