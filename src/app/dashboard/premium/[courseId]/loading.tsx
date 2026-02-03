import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<Skeleton className="h-8 w-2/3 mb-2" />
				<Skeleton className="h-6 w-1/3 mb-6" />

				<Skeleton className="aspect-video w-full mb-8" />

				<div className="space-y-4">
					<Skeleton className="h-6 w-1/4 mb-4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>

				<Skeleton className="h-10 w-48 mt-6" />
			</div>
		</div>
	);
}
