"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Driver_controller_1 = require("../controller/Driver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.authenticate, role_middleware_1.driverMiddleware, Driver_controller_1.getMyDriverProfileController);
router.patch("/availability", auth_middleware_1.authenticate, role_middleware_1.driverMiddleware, Driver_controller_1.updateDriverAvailabilityController);
// Routes pour les admins
router.post("/", auth_middleware_1.authenticate, role_middleware_1.adminMiddleware, Driver_controller_1.createDriverController);
router.get("/", auth_middleware_1.authenticate, role_middleware_1.adminMiddleware, Driver_controller_1.getAllDriversController);
router.get("/:id", auth_middleware_1.authenticate, role_middleware_1.adminMiddleware, Driver_controller_1.getDriverByIdController);
router.delete("/:id", auth_middleware_1.authenticate, role_middleware_1.adminMiddleware, Driver_controller_1.deleteDriverController);
exports.default = router;
