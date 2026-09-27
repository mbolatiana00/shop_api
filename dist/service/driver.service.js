"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDriver = exports.updateDriverAvailability = exports.getDriverByUserId = exports.getDriverById = exports.getAllDrivers = exports.createDriver = void 0;
const prisma_1 = require("../lib/prisma");
const createDriver = async (data) => {
    return prisma_1.prisma.driver.create({
        data: {
            userId: data.userId,
            licenseNo: data.licenseNo,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                },
            },
        },
    });
};
exports.createDriver = createDriver;
const getAllDrivers = async (isAvailable) => {
    const where = isAvailable !== undefined ? { isAvailable } : {};
    return prisma_1.prisma.driver.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            vehicle: true,
            deliveries: {
                take: 5,
                orderBy: {
                    startedAt: "asc",
                },
                include: {
                    order: true,
                },
            },
        },
    });
};
exports.getAllDrivers = getAllDrivers;
const getDriverById = async (id) => {
    return prisma_1.prisma.driver.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            vehicle: true,
            deliveries: {
                include: {
                    order: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    startedAt: "desc",
                },
            },
        },
    });
};
exports.getDriverById = getDriverById;
const getDriverByUserId = async (userId) => {
    return prisma_1.prisma.driver.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            vehicle: true,
            deliveries: {
                include: {
                    order: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    startedAt: "desc",
                },
            },
        },
    });
};
exports.getDriverByUserId = getDriverByUserId;
const updateDriverAvailability = async (driverId, isAvailable) => {
    return prisma_1.prisma.driver.update({
        where: { id: driverId },
        data: { isAvailable },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            vehicle: true,
        },
    });
};
exports.updateDriverAvailability = updateDriverAvailability;
const deleteDriver = async (driverId) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        await tx.vehicle.deleteMany({
            where: { driverId },
        });
        return tx.driver.delete({
            where: { id: driverId },
        });
    });
};
exports.deleteDriver = deleteDriver;
