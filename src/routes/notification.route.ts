import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  listNotifications,
  readAllNotifications,
  readNotification,
  registerFcmToken,
  removeNotification,
  unregisterFcmToken,
} from "../controller/Notification.controller";

const router = Router();

router.use(authenticate);
router.post("/device-token", registerFcmToken);
router.delete("/device-token", unregisterFcmToken);
router.get("/", listNotifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:id/read", readNotification);
router.delete("/:id", removeNotification);

export default router;
