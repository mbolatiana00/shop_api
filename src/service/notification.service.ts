import { prisma } from "../lib/prisma";
import {
	NotificationStatus,
	NotificationType,
} from "../generated/prisma/enums";
import { firebaseMessaging } from "../firebase";

type NotificationData = Record<string, unknown> | string;

export type CreateNotificationInput = {
	userId: number;
	title: string;
	message: string;
	type: NotificationType;
	data?: NotificationData;
	status?: NotificationStatus;
};

export const registerDeviceToken = async (
	userId: number,
	token: string,
	platform?: string,
) => {
	return prisma.deviceToken.upsert({
		where: { token },
		create: { userId, token, platform },
		update: { userId, platform },
	});
};

export const removeDeviceToken = (userId: number, token: string) => {
	return prisma.deviceToken.deleteMany({ where: { userId, token } });
};

const serializeData = (data?: NotificationData) => {
	if (data === undefined) return undefined;
	return typeof data === "string" ? data : JSON.stringify(data);
};

/** Creates a notification linked to its User relation. */
export const createNotification = async ({
	userId,
	title,
	message,
	type,
	data,
	status = NotificationStatus.PENDING,
}: CreateNotificationInput) => {
	const notification = await prisma.notification.create({
		data: {
			title,
			message,
			type,
			status,
			data: serializeData(data),
			user: { connect: { id: userId } },
		},
	});

	if (!firebaseMessaging) return notification;

	const devices = await prisma.deviceToken.findMany({ where: { userId } });
	if (devices.length === 0) return notification;

	try {
		const result = await firebaseMessaging.sendEachForMulticast({
			tokens: devices.map((device: { token: string }) => device.token),
			notification: { title, body: message },
			data: {
				type,
				notificationId: String(notification.id),
				...(typeof data === "string" ? { data } : data ?? {}),
			},
		});

		const invalidTokens = result.responses
			.map((response, index) =>
				!response.success && response.error?.code?.includes("registration-token")
					? devices[index].token
					: null,
			)
			.filter((token): token is string => token !== null);

		if (invalidTokens.length > 0) {
			await prisma.deviceToken.deleteMany({ where: { token: { in: invalidTokens } } });
		}

		await prisma.notification.update({
			where: { id: notification.id },
			data: {
				status: result.successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED,
				sentAt: result.successCount > 0 ? new Date() : undefined,
			},
		});
	} catch (error) {
		console.error("Échec d'envoi de la notification Firebase :", error);
	}

	return notification;
};

export const notifyUserWelcome = async (userId: number, name?: string) => {
	return createNotification({
		userId,
		title: "Bienvenue",
		message: `Bienvenue${name ? ` ${name}` : ""} ! Votre compte a été créé avec succès.`,
		type: NotificationType.SYSTEM,
		data: { screen: "home", action: "welcome" },
	});
};

export const notifyPaymentSuccess = async (userId: number, orderId: number, amount?: number) => {
	return createNotification({
		userId,
		title: "Paiement réussi",
		message: "Votre paiement a été confirmé.",
		type: NotificationType.PAYMENT_SUCCESS,
		data: {
			orderId,
			amount,
			status: "PAID",
		},
	});
};

export const notifyPaymentFailed = async (userId: number, orderId: number, amount?: number) => {
	return createNotification({
		userId,
		title: "Paiement échoué",
		message: "Le paiement n’a pas été accepté. Veuillez réessayer.",
		type: NotificationType.PAYMENT_FAILED,
		data: {
			orderId,
			amount,
			status: "FAILED",
		},
	});
};

export const notifyDeliveryAssigned = async (
	userId: number,
	orderId: number,
	deliveryId?: number,
) => {
	return createNotification({
		userId,
		title: "Livraison assignée",
		message: "Un livreur a été attribué à votre commande.",
		type: NotificationType.DRIVER_ASSIGNED,
		data: {
			orderId,
			deliveryId,
			status: "ASSIGNED",
		},
	});
};

export const notifyOrderDelivered = async (userId: number, orderId: number) => {
	return createNotification({
		userId,
		title: "Commande livrée",
		message: "Votre commande a été livrée avec succès.",
		type: NotificationType.ORDER_DELIVERED,
		data: {
			orderId,
			status: "DELIVERED",
		},
	});
};

export const getUserNotifications = async (
	userId: number,
	options: { unreadOnly?: boolean; take?: number; skip?: number } = {}
) => {
	const notifications = await prisma.notification.findMany({
		where: {
			userId,
			...(options.unreadOnly ? { read: false } : {}),
		},
		orderBy: { createdAt: "desc" },
		take: options.take,
		skip: options.skip,
	});

	return notifications;
};

export const countUnreadNotifications = (userId: number) => {
	return prisma.notification.count({
		where: { userId, read: false },
	});
};

export const markNotificationAsRead = async (userId: number, id: number) => {
	const result = await prisma.notification.updateMany({
		where: { id, userId, read: false },
		data: { read: true, readAt: new Date() },
	});

	return result.count > 0;
};

export const markAllNotificationsAsRead = async (userId: number) => {
	return prisma.notification.updateMany({
		where: { userId, read: false },
		data: { read: true, readAt: new Date() },
	});
};

export const deleteNotification = async (userId: number, id: number) => {
	const result = await prisma.notification.deleteMany({
		where: { id, userId },
	});

	return result.count > 0;
};
