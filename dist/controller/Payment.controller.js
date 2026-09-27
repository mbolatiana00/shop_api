"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaymentController = exports.updatePaymentStatusController = exports.getOrderPaymentController = exports.getPaymentByIdController = exports.createPaymentController = void 0;
const payment_service_1 = require("../service/payment.service");
const order_service_1 = require("../service/order.service");
// Créer un paiement pour une commande
const createPaymentController = async (req, res) => {
    try {
        const { orderId, amount, method } = req.body;
        const userId = req.user.id;
        if (!orderId || !amount || !method) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Vérifier que la commande existe et appartient à l'utilisateur
        const order = await (0, order_service_1.getOrderById)(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        // Vérifier qu'il n'y a pas déjà un paiement
        const existingPayment = await (0, payment_service_1.getOrderPayment)(orderId);
        if (existingPayment) {
            return res
                .status(400)
                .json({ message: "Payment already exists for this order" });
        }
        const payment = await (0, payment_service_1.createPayment)({
            orderId,
            amount,
            method,
        });
        res.status(201).json({
            message: "Payment created successfully",
            payment,
        });
    }
    catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res
                .status(400)
                .json({ message: "Payment already exists for this order" });
        }
        res.status(500).json({ message: "Error creating payment" });
    }
};
exports.createPaymentController = createPaymentController;
// Obtenir un paiement par ID
const getPaymentByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await (0, payment_service_1.getPaymentById)(parseInt(id));
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching payment" });
    }
};
exports.getPaymentByIdController = getPaymentByIdController;
// Obtenir le paiement d'une commande
const getOrderPaymentController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const order = await (0, order_service_1.getOrderById)(parseInt(orderId));
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Vérifier les permissions
        if (userRole !== "ADMIN" && order.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        const payment = await (0, payment_service_1.getOrderPayment)(parseInt(orderId));
        if (!payment) {
            return res
                .status(404)
                .json({ message: "No payment found for this order" });
        }
        res.json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching payment" });
    }
};
exports.getOrderPaymentController = getOrderPaymentController;
// Mettre à jour le statut d'un paiement (ADMIN)
const updatePaymentStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const payment = await (0, payment_service_1.updatePaymentStatus)(parseInt(id), status);
        res.json({
            message: "Payment status updated successfully",
            payment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating payment status" });
    }
};
exports.updatePaymentStatusController = updatePaymentStatusController;
// Confirmer un paiement (webhook ou simulation)
const confirmPaymentController = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await (0, payment_service_1.getPaymentById)(parseInt(id));
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        if (payment.status === "PAID") {
            return res.status(400).json({ message: "Payment already confirmed" });
        }
        const updatedPayment = await (0, payment_service_1.updatePaymentStatus)(parseInt(id), "PAID");
        res.json({
            message: "Payment confirmed successfully",
            payment: updatedPayment,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error confirming payment" });
    }
};
exports.confirmPaymentController = confirmPaymentController;
