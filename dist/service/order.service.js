"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getOrderById = exports.getUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const enums_1 = require("../generated/prisma/enums");
const prisma_1 = require("../lib/prisma");
const createOrder = async (data) => {
    return prisma_1.prisma.order.create({
        data: {
            userId: data.userId,
            restaurantId: data.restaurantId,
            pickupAddress: data.pickupAddress,
            deliveryAddress: data.deliveryAddress,
            totalPrice: data.price
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true }
            }
        }
    });
};
exports.createOrder = createOrder;
const getAllOrders = async (status) => {
    const where = status ? { status } : {};
    return prisma_1.prisma.order.findMany({
        where,
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true }
            },
            delivery: {
                include: {
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } },
                            vehicle: true,
                        },
                    },
                },
            },
            payment: true,
        },
        orderBy: { createdAt: "asc" }
    });
};
exports.getAllOrders = getAllOrders;
const getUserOrders = async (userId) => {
    return prisma_1.prisma.order.findMany({
        where: { userId },
        include: {
            delivery: {
                include: {
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } },
                            vehicle: true,
                        },
                    },
                },
            },
            payment: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserOrders = getUserOrders;
const getOrderById = async (id) => {
    return prisma_1.prisma.order.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true },
            },
            delivery: {
                include: {
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } },
                            vehicle: true,
                        },
                    },
                    tracking: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
            payment: true,
        },
    });
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (orderId, status) => {
    return prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true },
            },
            delivery: true,
        },
    });
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (orderId) => {
    return prisma_1.prisma.order.update({
        where: { id: orderId },
        data: { status: enums_1.OrderStatus.CANCELED },
    });
};
exports.cancelOrder = cancelOrder;
