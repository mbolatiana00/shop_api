import {prisma} from "../lib/prisma"
import { PaymentStatus, PaymentMethod } from "../generated/prisma/enums"


interface CreatePaymentData {
  orderId: number;
  amount: number;
  method: PaymentMethod; // ✅ FIX: string → PaymentMethod (enum Prisma)
}

export const createPayment = async (data: CreatePaymentData) => {
  return prisma.payment.create({
    data: {
      orderId: data.orderId,
      amount: data.amount,
      method: data.method, // ✅ FIX: "PaymentMethod" → "method" (nom du champ dans le schéma)
                           // ✅ FIX: "metPaymentMethod" → "method" (nom de la propriété corrigé)
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};

export const getPaymentById = async (id: number) => {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};

export const getOrderPayment = async (orderId: number) => {
  return prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          pickupAddress: true,
          deliveryAddress: true,
          totalPrice: true,
        },
      },
    },
  });
};

export const updatePaymentStatus = async (
  paymentId: number,
  status: PaymentStatus
) => {
  const data: { status: PaymentStatus; paidAt?: Date } = { status }; // ✅ FIX: any → type explicite

  // Si le paiement est marqué comme payé, enregistrer la date
  if (status === PaymentStatus.PAID) { // ✅ FIX: string "PAID" → enum PaymentStatus.PAID
    data.paidAt = new Date();
  }

  return prisma.payment.update({
    where: { id: paymentId },
    data,
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });
};