import { prisma } from "../lib/prisma";

interface CreateDriverData {
  userId: number;
  licenseNo: string;
}

export const createDriver = async (data: CreateDriverData) => {
  return prisma.driver.create({
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

export const getAllDrivers = async (isAvailable?: boolean) => {
  const where = isAvailable !== undefined ? { isAvailable } : {};
  return prisma.driver.findMany({
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

export const getDriverById = async (id: number) => {
  return prisma.driver.findUnique({
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

export const getDriverByUserId = async (userId: number) => {
  return prisma.driver.findUnique({
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

export const updateDriverAvailability = async (
  driverId: number,
  isAvailable: boolean,
) => {
  return prisma.driver.update({
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

export const deleteDriver = async (driverId: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.vehicle.deleteMany({
      where: { driverId },
    });
    return tx.driver.delete({
      where: { id: driverId },
    });
  });
};
