"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { getSession } from "@/lib/sessions";
import { returnValidationErrors } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { profileResponseSchema, profileSchema } from "./profile-validations";

export const profileAction = actionClient
	.schema(profileSchema)
	.outputSchema(profileResponseSchema)
	.action(async ({ parsedInput }) => {
		return await prisma.$transaction(async (tx) => {
			const session = await getSession();

			// Find existing profile or create new one
			const userProfile = await tx.userProfile.upsert({
				where: {
					id: await tx.userProfile
						.findFirst({
							where: { userId: session.userId },
							select: { id: true },
						})
						.then((profile) => profile?.id ?? "new"),
				},
				create: {
					user: {
						connect: { id: session.userId },
					},
					firstName: parsedInput.firstName ?? "",
					lastName: parsedInput.lastName ?? "",
					phone: parsedInput.phone ?? "",
					institution: parsedInput.institution ?? "",
					address: parsedInput.address ?? "",
					city: parsedInput.city ?? "",
					province: parsedInput.province ?? "",
				},
				update: {
					firstName: parsedInput.firstName ?? "",
					lastName: parsedInput.lastName ?? "",
					phone: parsedInput.phone ?? "",
					institution: parsedInput.institution ?? "",
					address: parsedInput.address ?? "",
					city: parsedInput.city ?? "",
					province: parsedInput.province ?? "",
				},
			});

			if (!userProfile) {
				returnValidationErrors(profileSchema, {
					_errors: ["Gagal memperbarui profil"],
				});
			}

			// Revalidate header to update user name
			revalidatePath("/dashboard", "layout");

			// Return success response
			return {
				success: true,
				message: "Profil berhasil diperbarui",
			};
		});
	});
