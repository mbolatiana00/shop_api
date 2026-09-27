import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  confirmPaymentController,
  createPaymentController,
  getOrderPaymentController,
  getPaymentByIdController,
  updatePaymentStatusController,
} from "../controller/Payment.controller";

const router = Router();

router.use(authenticate);
router.post("/", createPaymentController);
router.get("/orders/:orderId", getOrderPaymentController);
router.get("/:id", getPaymentByIdController);
router.patch("/:id/status", authorizeRoles("ADMIN"), updatePaymentStatusController);
router.patch("/:id/confirm", authorizeRoles("ADMIN"), confirmPaymentController);

export default router;