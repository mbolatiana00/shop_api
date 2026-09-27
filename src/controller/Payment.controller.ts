import { Request, Response } from "express";
import { createPayment, getPaymentById, getOrderPayment, updatePaymentStatus } from "../service/payment.service";
import { getOrderById } from "../service/order.service";


// Créer un paiement pour une commande
export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, method } = req.body;
    const userId = (req as any).user.id;

    if (!orderId || !amount || !method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Vérifier qu'il n'y a pas déjà un paiement
    const existingPayment = await getOrderPayment(orderId);
    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Payment already exists for this order" });
    }

    const payment = await createPayment({
      orderId,
      amount,
      method,
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Payment already exists for this order" });
    }
    res.status(500).json({ message: "Error creating payment" });
  }
};

// Obtenir un paiement par ID
export const getPaymentByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentById(parseInt(id));

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// Obtenir le paiement d'une commande
export const getOrderPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const order = await getOrderById(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Vérifier les permissions
    if (userRole !== "ADMIN" && order.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payment = await getOrderPayment(parseInt(orderId));

    if (!payment) {
      return res
        .status(404)
        .json({ message: "No payment found for this order" });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

// Mettre à jour le statut d'un paiement (ADMIN)
export const updatePaymentStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const payment = await updatePaymentStatus(parseInt(id), status);

    res.json({
      message: "Payment status updated successfully",
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating payment status" });
  }
};

// Confirmer un paiement (webhook ou simulation)
export const confirmPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const payment = await getPaymentById(parseInt(id));
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "PAID") {
      return res.status(400).json({ message: "Payment already confirmed" });
    }

    const updatedPayment = await updatePaymentStatus(parseInt(id), "PAID");

    res.json({
      message: "Payment confirmed successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error confirming payment" });
  }
};
