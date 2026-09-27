"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderController = exports.updateOrderStatusController = exports.getOrderByIdController = exports.getMyOrdersController = exports.getAllOrdersController = exports.createOrderController = void 0;
const order_service_1 = require("../service/order.service");
const enums_1 = require("../generated/prisma/enums");
const notification_service_1 = require("../service/notification.service");
const socket_1 = require("../socket/socket");
const createOrderController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pickupAddress, deliveryAddress, price, restaurantId } = req.body; // ✅ ajoute restaurantId
        if (!pickupAddress || !deliveryAddress || !price || !restaurantId) { // ✅ vérifie restaurantId
            return res.status(400).json({ message: "Missing required fields" });
        }
        const order = await (0, order_service_1.createOrder)({
            userId,
            pickupAddress,
            deliveryAddress,
            price,
            restaurantId: Number(restaurantId), // ✅ lu depuis req.body
        });
        res.status(201).json({ message: "Order created successfully", order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating order" });
    }
};
exports.createOrderController = createOrderController;
const getAllOrdersController = async (req, res) => {
    try {
        const { status } = req.query;
        const orders = await (0, order_service_1.getAllOrders)(status); // ✅ snake_case
        res.json({ count: orders.length, orders });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching orders" });
    }
};
exports.getAllOrdersController = getAllOrdersController;
const getMyOrdersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await (0, order_service_1.getUserOrders)(userId);
        res.json({ count: orders.length, orders });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching orders" });
    }
};
exports.getMyOrdersController = getMyOrdersController;
const getOrderByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const order = await (0, order_service_1.getOrderById)(parseInt(id));
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (userRole !== "ADMIN" && order.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching order" });
    }
};
exports.getOrderByIdController = getOrderByIdController;
const updateOrderStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const order = await (0, order_service_1.updateOrderStatus)(parseInt(id), status);
        if (status === enums_1.OrderStatus.CONFIRMED) {
            (0, socket_1.notifyAvailableDrivers)(order.id);
            await (0, notification_service_1.createNotification)({
                userId: order.userId,
                title: "Commande confirmée",
                message: `Votre commande #${order.id} a été confirmée`,
                type: enums_1.NotificationType.ORDER_ACCEPTED,
                data: { orderId: order.id, status },
            });
        }
        if (status === enums_1.OrderStatus.DELIVERED) {
            (0, socket_1.notifyOrderRoom)(order.id, "order:status-update", { orderId: order.id, status });
            await (0, notification_service_1.createNotification)({
                userId: order.userId,
                title: "Commande livrée",
                message: `Votre commande #${order.id} a été livrée`,
                type: enums_1.NotificationType.ORDER_DELIVERED,
                data: { orderId: order.id, status },
            });
        }
        res.json({ message: "Order status updated", order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating order status" });
    }
};
exports.updateOrderStatusController = updateOrderStatusController;
const cancelOrderController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;
        const order = await (0, order_service_1.getOrderById)(parseInt(id));
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (userRole !== "ADMIN" && order.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        // ✅ Utilisation de order_status enum pour la comparaison
        if ([enums_1.OrderStatus.DELIVERED, enums_1.OrderStatus.CANCELED].includes(order.status)) {
            return res.status(400).json({
                message: "Cannot cancel order with status: " + order.status,
            });
        }
        const canceledOrder = await (0, order_service_1.cancelOrder)(parseInt(id));
        res.json({ message: "Order canceled successfully", order: canceledOrder });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error canceling order" });
    }
};
exports.cancelOrderController = cancelOrderController;
