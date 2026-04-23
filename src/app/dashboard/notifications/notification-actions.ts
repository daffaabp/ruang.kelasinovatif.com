"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { NotificationType } from "@prisma/client";
import { z } from "zod";

export const getNotificationsAction = actionClient
	.schema(z.object({ limit: z.number().min(1).max(50).default(20) }))
	.action(async ({ parsedInput }) => {
		try {
			const [notifications, unreadCount] = await Promise.all([
				prisma.notification.findMany({
					orderBy: { createdAt: "desc" },
					take: parsedInput.limit,
				}),
				prisma.notification.count({ where: { isRead: false } }),
			]);
			return { notifications, unreadCount };
		} catch (error) {
			console.error("Get notifications error:", error);
			throw error;
		}
	});

export const markNotificationsReadAction = actionClient
	.schema(z.object({ ids: z.array(z.string()).optional() }))
	.action(async ({ parsedInput }) => {
		try {
			if (parsedInput.ids && parsedInput.ids.length > 0) {
				await prisma.notification.updateMany({
					where: { id: { in: parsedInput.ids } },
					data: { isRead: true },
				});
			} else {
				await prisma.notification.updateMany({
					where: { isRead: false },
					data: { isRead: true },
				});
			}
			return { success: true };
		} catch (error) {
			console.error("Mark notifications read error:", error);
			throw error;
		}
	});

export async function createNotification(
	type: NotificationType,
	title: string,
	message: string,
	metadata?: Record<string, string | number | boolean | null>,
) {
	try {
		await prisma.notification.create({
			data: {
				type,
				title,
				message,
				// Prisma expects InputJsonValue; cast through unknown to satisfy strict types
				...(metadata ? { metadata: metadata as unknown as Parameters<typeof prisma.notification.create>[0]["data"]["metadata"] } : {}),
			},
		});
	} catch (error) {
		console.error("Create notification error:", error);
	}
}
