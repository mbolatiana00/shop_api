"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNotification = exports.readAllNotifications = exports.readNotification = exports.listNotifications = exports.unregisterFcmToken = exports.registerFcmToken = void 0;
const notification_service_1 = require("../service/notification.service");
const registerFcmToken = async (req, res) => {
    const token = req.body?.token;
    const platform = req.body?.platform;
    if (typeof token !== "string" || token.trim().length === 0) {
        return res.status(400).json({ message: "Token FCM obligatoire" });
    }
    const deviceToken = await (0, notification_service_1.registerDeviceToken)(req.user.id, token.trim(), typeof platform === "string" ? platform : undefined);
    return res.status(201).json({
        message: "Token FCM enregistré",
        deviceToken: { id: deviceToken.id, platform: deviceToken.platform },
    });
};
exports.registerFcmToken = registerFcmToken;
const unregisterFcmToken = async (req, res) => {
    const token = req.body?.token;
    if (typeof token !== "string" || token.trim().length === 0) {
        return res.status(400).json({ message: "Token FCM obligatoire" });
    }
    await (0, notification_service_1.removeDeviceToken)(req.user.id, token.trim());
    return res.status(204).send();
};
exports.unregisterFcmToken = unregisterFcmToken;
const listNotifications = async (req, res) => {
    const unreadOnly = req.query.unreadOnly === "true";
    const notifications = await (0, notification_service_1.getUserNotifications)(req.user.id, { unreadOnly });
    const unread = await (0, notification_service_1.countUnreadNotifications)(req.user.id);
    return res.status(200).json({ notifications, unread });
};
exports.listNotifications = listNotifications;
const readNotification = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Identifiant invalide" });
    }
    const updated = await (0, notification_service_1.markNotificationAsRead)(req.user.id, id);
    if (!updated)
        return res.status(404).json({ message: "Notification introuvable" });
    return res.status(204).send();
};
exports.readNotification = readNotification;
const readAllNotifications = async (req, res) => {
    await (0, notification_service_1.markAllNotificationsAsRead)(req.user.id);
    return res.status(204).send();
};
exports.readAllNotifications = readAllNotifications;
const removeNotification = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Identifiant invalide" });
    }
    const deleted = await (0, notification_service_1.deleteNotification)(req.user.id, id);
    if (!deleted)
        return res.status(404).json({ message: "Notification introuvable" });
    return res.status(204).send();
};
exports.removeNotification = removeNotification;
