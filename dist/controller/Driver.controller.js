"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDriverController = exports.updateDriverAvailabilityController = exports.getMyDriverProfileController = exports.getDriverByIdController = exports.getAllDriversController = exports.createDriverController = void 0;
const driver_service_1 = require("../service/driver.service");
const createDriverController = async (request, response) => {
    try {
        const { userId, licenseNo } = request.body;
        if (!userId || !licenseNo) {
            return response
                .status(400)
                .json({ message: "Erreur le champ est required" });
        }
        const driver = await (0, driver_service_1.createDriver)({ userId, licenseNo });
        response.status(201).json({ message: " livreur  ", driver });
    }
    catch (error) {
        if (error.code === "P2002") {
            return response.status(400).json({ message: "" });
        }
        response.status(500).json({ message: "" });
    }
};
exports.createDriverController = createDriverController;
// Obtenir tous les livreurs
const getAllDriversController = async (req, res) => {
    try {
        const { available } = req.query;
        const isAvailable = available === "true" ? true : available === "false" ? false : undefined;
        const drivers = await (0, driver_service_1.getAllDrivers)(isAvailable);
        res.json({
            count: drivers.length,
            drivers,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching drivers" });
    }
};
exports.getAllDriversController = getAllDriversController;
// Obtenir un livreur par ID
const getDriverByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await (0, driver_service_1.getDriverById)(parseInt(id));
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }
        res.json(driver);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching driver" });
    }
};
exports.getDriverByIdController = getDriverByIdController;
// Obtenir le profil du livreur connecté
const getMyDriverProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const driver = await (0, driver_service_1.getDriverByUserId)(userId);
        if (!driver) {
            return res.status(404).json({ message: "Driver profile not found" });
        }
        res.json(driver);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching driver profile" });
    }
};
exports.getMyDriverProfileController = getMyDriverProfileController;
// Mettre à jour la disponibilité du livreur
const updateDriverAvailabilityController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isAvailable } = req.body;
        if (typeof isAvailable !== "boolean") {
            return res.status(400).json({ message: "isAvailable must be a boolean" });
        }
        const driver = await (0, driver_service_1.getDriverByUserId)(userId);
        if (!driver) {
            return res.status(404).json({ message: "Driver profile not found" });
        }
        const updatedDriver = await (0, driver_service_1.updateDriverAvailability)(driver.id, isAvailable);
        res.json({
            message: "Driver availability updated",
            driver: updatedDriver,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating driver availability" });
    }
};
exports.updateDriverAvailabilityController = updateDriverAvailabilityController;
// Supprimer un livreur
const deleteDriverController = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, driver_service_1.deleteDriver)(parseInt(id));
        res.json({
            message: "Driver deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting driver" });
    }
};
exports.deleteDriverController = deleteDriverController;
