"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.countUnreadNotifications = exports.getUserNotifications = exports.notifyOrderDelivered = exports.notifyDeliveryAssigned = exports.notifyPaymentFailed = exports.notifyPaymentSuccess = exports.notifyUserWelcome = exports.createNotification = exports.removeDeviceToken = exports.registerDeviceToken = void 0;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../generated/prisma/enums");
const firebase_1 = require("../firebase");
const registerDeviceToken = async (userId, token, platform) => {
    return prisma_1.prisma.deviceToken.upsert({
        where: { token },
        create: { userId, token, platform },
        update: { userId, platform },
    });
};
exports.registerDeviceToken = registerDeviceToken;
const removeDeviceToken = (userId, token) => {
    return prisma_1.prisma.deviceToken.deleteMany({ where: { userId, token } });
};
exports.removeDeviceToken = removeDeviceToken;
const serializeData = (data) => {
    if (data === undefined)
        return undefined;
    return typeof data === "string" ? data : JSON.stringify(data);
};
/** Creates a notification linked to its User relation. */
const createNotification = async ({ userId, title, message, type, data, status = enums_1.NotificationStatus.PENDING, }) => {
    const notification = await prisma_1.prisma.notification.create({
        data: {
            title,
            message,
            type,
            status,
            data: serializeData(data),
            user: { connect: { id: userId } },
        },
    });
    if (!firebase_1.firebaseMessaging)
        return notification;
    const devices = await prisma_1.prisma.deviceToken.findMany({ where: { userId } });
    if (devices.length === 0)
        return notification;
    try {
        const result = await firebase_1.firebaseMessaging.sendEachForMulticast({
            tokens: devices.map((device) => device.token),
            notification: { title, body: message },
            data: {
                type,
                notificationId: String(notification.id),
                ...(typeof data === "string" ? { data } : data ?? {}),
            },
        });
        const invalidTokens = result.responses
            .map((response, index) => !response.success && response.error?.code?.includes("registration-token")
            ? devices[index].token
            : null)
            .filter((token) => token !== null);
        if (invalidTokens.length > 0) {
            await prisma_1.prisma.deviceToken.deleteMany({ where: { token: { in: invalidTokens } } });
        }
        await prisma_1.prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: result.successCount > 0 ? enums_1.NotificationStatus.SENT : enums_1.NotificationStatus.FAILED,
                sentAt: result.successCount > 0 ? new Date() : undefined,
            },
        });
    }
    catch (error) {
        console.error("Échec d'envoi de la notification Firebase :", error);
    }
    return notification;
};
exports.createNotification = createNotification;
const notifyUserWelcome = async (userId, name) => {
    return (0, exports.createNotification)({
        userId,
        title: "Bienvenue",
        message: `Bienvenue${name ? ` ${name}` : ""} ! Votre compte a été créé avec succès.`,
        type: enums_1.NotificationType.SYSTEM,
        data: { screen: "home", action: "welcome" },
    });
};
exports.notifyUserWelcome = notifyUserWelcome;
const notifyPaymentSuccess = async (userId, orderId, amount) => {
    return (0, exports.createNotification)({
        userId,
        title: "Paiement réussi",
        message: "Votre paiement a été confirmé.",
        type: enums_1.NotificationType.PAYMENT_SUCCESS,
        data: {
            orderId,
            amount,
            status: "PAID",
        },
    });
};
exports.notifyPaymentSuccess = notifyPaymentSuccess;
const notifyPaymentFailed = async (userId, orderId, amount) => {
    return (0, exports.createNotification)({
        userId,
        title: "Paiement échoué",
        message: "Le paiement n’a pas été accepté. Veuillez réessayer.",
        type: enums_1.NotificationType.PAYMENT_FAILED,
        data: {
            orderId,
            amount,
            status: "FAILED",
        },
    });
};
exports.notifyPaymentFailed = notifyPaymentFailed;
const notifyDeliveryAssigned = async (userId, orderId, deliveryId) => {
    return (0, exports.createNotification)({
        userId,
        title: "Livraison assignée",
        message: "Un livreur a été attribué à votre commande.",
        type: enums_1.NotificationType.DRIVER_ASSIGNED,
        data: {
            orderId,
            deliveryId,
            status: "ASSIGNED",
        },
    });
};
exports.notifyDeliveryAssigned = notifyDeliveryAssigned;
const notifyOrderDelivered = async (userId, orderId) => {
    return (0, exports.createNotification)({
        userId,
        title: "Commande livrée",
        message: "Votre commande a été livrée avec succès.",
        type: enums_1.NotificationType.ORDER_DELIVERED,
        data: {
            orderId,
            status: "DELIVERED",
        },
    });
};
exports.notifyOrderDelivered = notifyOrderDelivered;
const getUserNotifications = async (userId, options = {}) => {
    const notifications = await prisma_1.prisma.notification.findMany({
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
exports.getUserNotifications = getUserNotifications;
const countUnreadNotifications = (userId) => {
    return prisma_1.prisma.notification.count({
        where: { userId, read: false },
    });
};
exports.countUnreadNotifications = countUnreadNotifications;
const markNotificationAsRead = async (userId, id) => {
    const result = await prisma_1.prisma.notification.updateMany({
        where: { id, userId, read: false },
        data: { read: true, readAt: new Date() },
    });
    return result.count > 0;
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (userId) => {
    return prisma_1.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true, readAt: new Date() },
    });
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = async (userId, id) => {
    const result = await prisma_1.prisma.notification.deleteMany({
        where: { id, userId },
    });
    return result.count > 0;
};
exports.deleteNotification = deleteNotification;
