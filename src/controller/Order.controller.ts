import { Request, Response } from "express";
import {createOrder, getAllOrders, getUserOrders, getOrderById, cancelOrder, updateOrderStatus}from "../service/order.service"
import { NotificationType, OrderStatus } from "../generated/prisma/enums";
import { createNotification } from "../service/notification.service";
import { notifyAvailableDrivers, notifyOrderRoom } from "../socket/socket";



export const createOrderController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { pickupAddress, deliveryAddress, price, restaurantId } = req.body; // ✅ ajoute restaurantId

    if (!pickupAddress || !deliveryAddress || !price || !restaurantId) { // ✅ vérifie restaurantId
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await createOrder({
      userId,
      pickupAddress,
      deliveryAddress,
      price,
      restaurantId: Number(restaurantId), // ✅ lu depuis req.body
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const orders = await getAllOrders(status as OrderStatus); // ✅ snake_case
    res.json({ count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const getMyOrdersController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await getUserOrders(userId);
    res.json({ count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const order = await getOrderById(parseInt(id));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (userRole !== "ADMIN" && order.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await updateOrderStatus(parseInt(id), status);

    if (status === OrderStatus.CONFIRMED) {
      notifyAvailableDrivers(order.id);
      await createNotification({
        userId: order.userId,
        title: "Commande confirmée",
        message: `Votre commande #${order.id} a été confirmée`,
        type: NotificationType.ORDER_ACCEPTED,
        data: { orderId: order.id, status },
      });
    }

    if (status === OrderStatus.DELIVERED) {
      notifyOrderRoom(order.id, "order:status-update", { orderId: order.id, status });
      await createNotification({
        userId: order.userId,
        title: "Commande livrée",
        message: `Votre commande #${order.id} a été livrée`,
        type: NotificationType.ORDER_DELIVERED,
        data: { orderId: order.id, status },
      });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};
export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const order = await getOrderById(parseInt(id));

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (userRole !== "ADMIN" && order.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Utilisation de order_status enum pour la comparaison
    if (([OrderStatus.DELIVERED, OrderStatus.CANCELED] as OrderStatus[]).includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel order with status: " + order.status,
      });
    }

    const canceledOrder = await cancelOrder(parseInt(id));
    res.json({ message: "Order canceled successfully", order: canceledOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error canceling order" });
  }
};