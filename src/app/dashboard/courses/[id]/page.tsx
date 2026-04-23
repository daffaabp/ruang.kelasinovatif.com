import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDetailCoursesAction } from "../../detailcourse/detailcourse-actions";
import { DetailCourseAddModal } from "../../detailcourse/detailcourse-add-modal";
import type { PaginatedResult as DetailPaginatedResult } from "../../detailcourse/detailcourse-types";
import { SortableRecordingTable } from "./sortable-recording-table";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
	const { id } = await params;

	// Fetch course dengan stats (jumlah rekaman + total akses granular per rekaman)
	const course = await prisma.courses.findUnique({
		where: { id },
		include: {
			_count: {
				select: {
					CourseDetails: true,
				},
			},
			CourseDetails: {
				select: {
					_count: {
						select: {
							UserCourseDetails: true,
						},
					},
				},
			},
		},
	});

	if (!course) {
		notFound();
	}

	const totalUserAccesses = course.CourseDetails.reduce(
		(sum, d) => sum + d._count.UserCourseDetails,
		0,
	);

	// Fetch materials untuk tabel awal
	const detailResult = await getDetailCoursesAction({
		page: 1,
		perPage: 5,
		courseId: id,
	});

	if (!detailResult || !("data" in detailResult) || !detailResult.data) {
		throw new Error("Gagal memuat rekaman course");
	}

	const detailData = detailResult.data as DetailPaginatedResult;

	// courseOptions hanya berisi course ini (untuk konteks edit modal di tabel)
	// tapi kita tetap ambil semua agar edit modal bisa pindah course jika admin mau
	const allCourses = await prisma.courses.findMany({
		select: { id: true, courseName: true },
		orderBy: { courseName: "asc" },
	});

	return (
		<div className="space-y-6">
			{/* Navigasi balik */}
			<Button variant="ghost" size="sm" asChild className="-ml-1">
				<Link href="/dashboard/courses">
					<ArrowLeft className="h-4 w-4 mr-1" />
					Kembali ke Daftar Jenis Course
				</Link>
			</Button>

			{/* Header course */}
			<div className="rounded-lg border bg-white p-5 space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
					<div className="space-y-1">
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-xl font-bold tracking-tight">
								{course.courseName}
							</h1>
							{course.accessType === "FREE" ? (
								<Badge
									variant="outline"
									className="border-green-400 text-green-700 bg-green-50"
								>
									Free
								</Badge>
							) : (
								<Badge
									variant="outline"
									className="border-amber-400 text-amber-700 bg-amber-50"
								>
									Premium
								</Badge>
							)}
						</div>
						<p className="text-sm text-muted-foreground">
							{course.courseDescription}
						</p>
					</div>
					{course.accessType === "PREMIUM" && course.price && (
						<div className="text-right shrink-0">
							<p className="text-xs text-muted-foreground">Harga</p>
							<p className="font-semibold text-sm">
								Rp{" "}
								{new Intl.NumberFormat("id-ID").format(Number(course.price))}
							</p>
							{course.linkPayment && (
								<a
									href={course.linkPayment}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary hover:underline"
								>
									Link Pembayaran ↗
								</a>
							)}
						</div>
					)}
				</div>

				{/* Statistik */}
				<div className="flex gap-4 pt-2 border-t">
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<BookOpen className="h-4 w-4" />
						<span>
							<strong className="text-foreground">
								{course._count.CourseDetails}
							</strong>{" "}
							rekaman
						</span>
					</div>
					{course.accessType === "PREMIUM" && (
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Users className="h-4 w-4" />
							<span>
								<strong className="text-foreground">
									{totalUserAccesses}
								</strong>{" "}
								akses user (granular per rekaman)
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Section rekaman */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold">Rekaman & Materi</h2>
						<p className="text-sm text-muted-foreground">
							Kelola semua rekaman video dan materi untuk jenis course ini
						</p>
					</div>
					<DetailCourseAddModal
						details={detailData}
						courseOptions={allCourses}
						fixedCourseId={id}
						buttonLabel="+ Tambah Rekaman"
					/>
				</div>

			<Suspense
				fallback={
					<div className="flex items-center justify-center h-32 text-muted-foreground">
						Memuat rekaman...
					</div>
				}
			>
				<SortableRecordingTable
					initialData={detailData}
					courseOptions={allCourses}
					courseId={id}
				/>
			</Suspense>
			</div>
		</div>
	);
}
