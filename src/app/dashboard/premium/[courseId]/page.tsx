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

	// Jika rekaman ini ada di kategori FREE, lewati cek akses (bebas akses).
	if (courseDetail.course.accessType === "PREMIUM") {
		// Cek apakah user memiliki akses granular ke detail course ini
		const userAccess = await prisma.userCourseDetails.findUnique({
			where: {
				userId_courseDetailId: {
					userId: session.userId,
					courseDetailId: courseDetail.id,
				},
			},
		});

		if (!userAccess) {
			redirect("/dashboard/premium");
		}
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
		<div className="mx-auto max-w-5xl">
			<CourseDetail course={transformedCourse} />
		</div>
	);
}
