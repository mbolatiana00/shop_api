"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.getOrderPayment = exports.getPaymentById = exports.createPayment = void 0;
const prisma_1 = require("../lib/prisma");
const enums_1 = require("../generated/prisma/enums");
const createPayment = async (data) => {
    return prisma_1.prisma.payment.create({
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
exports.createPayment = createPayment;
const getPaymentById = async (id) => {
    return prisma_1.prisma.payment.findUnique({
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
exports.getPaymentById = getPaymentById;
const getOrderPayment = async (orderId) => {
    return prisma_1.prisma.payment.findUnique({
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
exports.getOrderPayment = getOrderPayment;
const updatePaymentStatus = async (paymentId, status) => {
    const data = { status }; // ✅ FIX: any → type explicite
    // Si le paiement est marqué comme payé, enregistrer la date
    if (status === enums_1.PaymentStatus.PAID) { // ✅ FIX: string "PAID" → enum PaymentStatus.PAID
        data.paidAt = new Date();
    }
    return prisma_1.prisma.payment.update({
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
exports.updatePaymentStatus = updatePaymentStatus;
