import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  createTrackingController,
  listTrackingController,
} from "../controller/Tracking.controller";

const router = Router();

router.use(authenticate);
router.post(
  "/deliveries/:deliveryId/locations",
  authorizeRoles("DRIVER", "ADMIN"),
  createTrackingController,
);
router.get("/deliveries/:deliveryId/locations", listTrackingController);

export default router;