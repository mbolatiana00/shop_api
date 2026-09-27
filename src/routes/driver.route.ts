import { Router } from "express";
import {
    createDriverController,
    getAllDriversController,
    getDriverByIdController,
    getMyDriverProfileController,
    updateDriverAvailabilityController,
    deleteDriverController
} from "../controller/Driver.controller"

import { authenticate,  } from "../middleware/auth.middleware";
import {  driverMiddleware,adminMiddleware } from "../middleware/role.middleware";

const router = Router()

router.get(
    "/me",
    authenticate,
    driverMiddleware,
    getMyDriverProfileController
  );
  router.patch(
    "/availability",
    authenticate,
    driverMiddleware,
    updateDriverAvailabilityController
  );
  
  // Routes pour les admins
  router.post("/", authenticate, adminMiddleware, createDriverController);
  router.get("/", authenticate, adminMiddleware, getAllDriversController);
  router.get("/:id", authenticate, adminMiddleware, getDriverByIdController);
  router.delete("/:id", authenticate, adminMiddleware, deleteDriverController);
  
  export default router;

