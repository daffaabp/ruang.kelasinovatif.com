import { getSession } from "@/lib/sessions";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getFreeCourseById } from "../course-actions";
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
	const course = await getFreeCourseById(resolvedParams.courseId);

	if (!course) {
		return {
			title: "Materi Tidak Ditemukan",
		};
	}

	return {
		title: course.title,
		description: course.description,
	};
}

export default async function CoursePage({ params }: CoursePageProps) {
	const session = await getSession();

	if (!session.userId) {
		redirect("/auth/login");
	}

	const resolvedParams = await params;
	const courseDetail = await getFreeCourseById(resolvedParams.courseId);

	if (!courseDetail) {
		notFound();
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
