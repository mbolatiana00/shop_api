"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTrackingController = exports.createTrackingController = void 0;
const tracking_service_1 = require("../service/tracking.service");
const canAccessDelivery = (req, delivery) => {
    const user = req.user;
    return user.role === "ADMIN" ||
        delivery.driver.userId === user.id ||
        delivery.order.userId === user.id;
};
const createTrackingController = async (req, res) => {
    try {
        const deliveryId = Number(req.params.deliveryId);
        const { latitude, longitude, accuracy } = req.body ?? {};
        if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
            return res.status(400).json({ message: "Identifiant de livraison invalide" });
        }
        if (typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180) {
            return res.status(400).json({ message: "Coordonnées GPS invalides" });
        }
        if (accuracy !== undefined &&
            (typeof accuracy !== "number" || !Number.isFinite(accuracy) || accuracy < 0)) {
            return res.status(400).json({ message: "Précision GPS invalide" });
        }
        const delivery = await (0, tracking_service_1.getDeliveryForAccess)(deliveryId);
        if (!delivery)
            return res.status(404).json({ message: "Livraison introuvable" });
        const tracking = await (0, tracking_service_1.addTrackingPoint)({ deliveryId, latitude, longitude, accuracy });
        return res.status(201).json({ message: "Position enregistrée", tracking });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur lors de l'enregistrement du tracking" });
    }
};
exports.createTrackingController = createTrackingController;
const listTrackingController = async (req, res) => {
    try {
        const deliveryId = Number(req.params.deliveryId);
        if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
            return res.status(400).json({ message: "Identifiant de livraison invalide" });
        }
        const delivery = await (0, tracking_service_1.getDeliveryForAccess)(deliveryId);
        if (!delivery)
            return res.status(404).json({ message: "Livraison introuvable" });
        if (!canAccessDelivery(req, delivery))
            return res.status(403).json({ message: "Accès refusé" });
        const tracking = await (0, tracking_service_1.getDeliveryTracking)(deliveryId);
        return res.json({ deliveryId, tracking });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur lors de la récupération du tracking" });
    }
};
exports.listTrackingController = listTrackingController;
