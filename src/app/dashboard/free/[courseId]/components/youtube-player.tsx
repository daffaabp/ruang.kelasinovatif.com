"use client";

interface YouTubePlayerProps {
	videoId: string;
	title: string;
}

export function getYouTubeId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
		/youtube\.com\/embed\/([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1] || (match && match[0].length === 11)) {
			return match[1] || match[0];
		}
	}

	return null;
}

export default function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
	return (
		<iframe
			className="w-full h-full"
			src={`https://www.youtube.com/embed/${videoId}?rel=0&stbranding=1`}
			title={title}
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowFullScreen
			referrerPolicy="strict-origin-when-cross-origin"
		/>
	);
}
