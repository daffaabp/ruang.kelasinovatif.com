"use server";

import { actionClient } from "@/lib/safe-action";
import { getSession } from "@/lib/sessions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const logoutAction = actionClient.action(async () => {
	const session = await getSession();
	session.destroy();

	revalidatePath("/dashboard");
	redirect("/auth/login");
});
