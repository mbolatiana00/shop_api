import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  countUnreadNotifications,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerDeviceToken,
  removeDeviceToken,
} from "../service/notification.service";

export const registerFcmToken = async (req: AuthRequest, res: Response) => {
  const token = req.body?.token;
  const platform = req.body?.platform;

  if (typeof token !== "string" || token.trim().length === 0) {
    return res.status(400).json({ message: "Token FCM obligatoire" });
  }

  const deviceToken = await registerDeviceToken(
    req.user!.id,
    token.trim(),
    typeof platform === "string" ? platform : undefined,
  );

  return res.status(201).json({
    message: "Token FCM enregistré",
    deviceToken: { id: deviceToken.id, platform: deviceToken.platform },
  });
};

export const unregisterFcmToken = async (req: AuthRequest, res: Response) => {
  const token = req.body?.token;
  if (typeof token !== "string" || token.trim().length === 0) {
    return res.status(400).json({ message: "Token FCM obligatoire" });
  }

  await removeDeviceToken(req.user!.id, token.trim());
  return res.status(204).send();
};

export const listNotifications = async (req: AuthRequest, res: Response) => {
  const unreadOnly = req.query.unreadOnly === "true";
  const notifications = await getUserNotifications(req.user!.id, { unreadOnly });
  const unread = await countUnreadNotifications(req.user!.id);
  return res.status(200).json({ notifications, unread });
};

export const readNotification = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const updated = await markNotificationAsRead(req.user!.id, id);
  if (!updated) return res.status(404).json({ message: "Notification introuvable" });
  return res.status(204).send();
};

export const readAllNotifications = async (req: AuthRequest, res: Response) => {
  await markAllNotificationsAsRead(req.user!.id);
  return res.status(204).send();
};

export const removeNotification = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const deleted = await deleteNotification(req.user!.id, id);
  if (!deleted) return res.status(404).json({ message: "Notification introuvable" });
  return res.status(204).send();
};
