import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPremiumCourseById } from "../actions/courses";
import CourseDetail from "./components/course-detail";

interface CoursePageProps {
	params: Promise<{
		courseId: string;
	}>;
}

export async function generateMetadata({
	params,
}: CoursePageProps): Promise<Metadata> {
	const resolvedParams = await params;
	const course = await getPremiumCourseById(resolvedParams.courseId);

	if (!course) {
		return {
			title: "Course Not Found",
		};
	}

	return {
		title: course.title,
		description: course.description,
	};
}

export default async function CoursePage({ params }: CoursePageProps) {
	const session = await getSession();
	const resolvedParams = await params;

	if (!session.userId) {
		redirect("/auth/login");
	}

	// Ambil detail course beserta course parent-nya
	const courseDetail = await prisma.courseDetails.findUnique({
		where: {
			id: resolvedParams.courseId,
		},
		include: {
			course: true,
		},
	});

	if (!courseDetail) {
		notFound();
	}

	// Cek apakah user memiliki akses ke course parent
	const userCourse = await prisma.userCourses.findFirst({
		where: {
			userId: session.userId,
			courseId: courseDetail.course.id, // Menggunakan ID course parent
		},
	});

	// Jika user tidak memiliki akses ke course parent, redirect ke halaman premium
	if (!userCourse) {
		redirect("/dashboard/premium");
	}

	// Transform the data to match the expected type
	const transformedCourse = {
		...courseDetail,
		course: {
			id: courseDetail.course.id,
			courseName: courseDetail.course.courseName,
		},
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
				<CourseDetail course={transformedCourse} />
			</div>
		</main>
	);
}
