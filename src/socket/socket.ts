import { Socket, Server } from "socket.io";
import {Server as HttpServer } from "http";
import jwt from 'jsonwebtoken';
import {prisma} from "../lib/prisma"

let io : Server
const connectDrivers = new Map<number, string>()

interface AuthdSocket extends Socket {
    userId?: number,
    role?: string
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateETA(distanceKm: number, avgSpeedKmh = 25): number {
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket: AuthdSocket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Token manquant"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
        role: string;
      };
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentification invalide"));
    }
  });

  io.on("connection", (socket: AuthdSocket) => {
    console.log(`? Socket connecté: user ${socket.userId} (${socket.role})`);

    if (socket.role === "DRIVER" && socket.userId) {
      connectDrivers.set(socket.userId, socket.id);
    }

    socket.on("order:join", ({ orderId }: { orderId: number }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("order:leave", ({ orderId }: { orderId: number }) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on(
      "driver:location",
      async ({
        deliveryId,
        latitude,
        longitude,
        accuracy,
      }: {
        deliveryId: number;
        latitude: number;
        longitude: number;
        accuracy?: number;
      }) => {
        try {
          const delivery = await prisma.delivery.findUnique({
            where: { id: deliveryId },
            include: { order: true },
          });
          if (!delivery) return;

          const distanceKm = haversineDistance(
            latitude,
            longitude,
            delivery.order.deliveryLat ?? 0,
            delivery.order.deliveryLng ?? 0
          );
          const etaMinutes = calculateETA(distanceKm);

          await prisma.tracking.create({
            data: { deliveryId, latitude, longitude, accuracy },
          });

          io.to(`order:${delivery.orderId}`).emit("location:update", {
            orderId: delivery.orderId,
            deliveryId,
            latitude,
            longitude,
            distanceKm: Number(distanceKm.toFixed(2)),
            etaMinutes,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Erreur driver:location", err);
        }
      }
    );

    socket.on("disconnect", () => {
      if (socket.role === "DRIVER" && socket.userId) {
        connectDrivers.delete(socket.userId);
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO non initialisé");
  return io;
}

export function notifyAvailableDrivers(orderId: number) {
  getIO().emit("order:new-available", { orderId });
}

export function notifyOrderRoom(orderId: number, event: string, payload: unknown) {
  getIO().to(`order:${orderId}`).emit(event, payload);
}

export { connectDrivers };
