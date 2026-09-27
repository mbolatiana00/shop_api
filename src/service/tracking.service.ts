import { prisma } from "../lib/prisma";

export const getDeliveryForAccess = (deliveryId: number) => {
  return prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      driver: { select: { userId: true } },
      order: { select: { id: true, userId: true } },
    },
  });
};

export const addTrackingPoint = (data: {
  deliveryId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
}) => {
  return prisma.tracking.create({
    data: {
      deliveryId: data.deliveryId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
    },
  });
};

export const getDeliveryTracking = (deliveryId: number) => {
  return prisma.tracking.findMany({
    where: { deliveryId },
    orderBy: { createdAt: "desc" },
  });
};