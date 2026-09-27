import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  cancelOrderController,
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} from "../controller/Order.controller";

const router = Router();

router.use(authenticate);

router.post("/", createOrderController);
router.get("/", getAllOrdersController);
router.get("/me", getMyOrdersController);
router.get("/:id", getOrderByIdController);
router.patch("/:id/status", updateOrderStatusController);
router.patch("/:id/cancel", cancelOrderController);

export default router;