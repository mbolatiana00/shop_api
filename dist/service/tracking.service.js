"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryTracking = exports.addTrackingPoint = exports.getDeliveryForAccess = void 0;
const prisma_1 = require("../lib/prisma");
const getDeliveryForAccess = (deliveryId) => {
    return prisma_1.prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
            driver: { select: { userId: true } },
            order: { select: { id: true, userId: true } },
        },
    });
};
exports.getDeliveryForAccess = getDeliveryForAccess;
const addTrackingPoint = (data) => {
    return prisma_1.prisma.tracking.create({
        data: {
            deliveryId: data.deliveryId,
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
        },
    });
};
exports.addTrackingPoint = addTrackingPoint;
const getDeliveryTracking = (deliveryId) => {
    return prisma_1.prisma.tracking.findMany({
        where: { deliveryId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getDeliveryTracking = getDeliveryTracking;
