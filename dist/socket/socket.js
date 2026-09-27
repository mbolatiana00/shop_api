"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDrivers = void 0;
exports.initSocket = initSocket;
exports.getIO = getIO;
exports.notifyAvailableDrivers = notifyAvailableDrivers;
exports.notifyOrderRoom = notifyOrderRoom;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
let io;
const connectDrivers = new Map();
exports.connectDrivers = connectDrivers;
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function calculateETA(distanceKm, avgSpeedKmh = 25) {
    return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: { origin: "*" },
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error("Token manquant"));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.role = decoded.role;
            next();
        }
        catch (err) {
            next(new Error("Authentification invalide"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`? Socket connecté: user ${socket.userId} (${socket.role})`);
        if (socket.role === "DRIVER" && socket.userId) {
            connectDrivers.set(socket.userId, socket.id);
        }
        socket.on("order:join", ({ orderId }) => {
            socket.join(`order:${orderId}`);
        });
        socket.on("order:leave", ({ orderId }) => {
            socket.leave(`order:${orderId}`);
        });
        socket.on("driver:location", async ({ deliveryId, latitude, longitude, accuracy, }) => {
            try {
                const delivery = await prisma_1.prisma.delivery.findUnique({
                    where: { id: deliveryId },
                    include: { order: true },
                });
                if (!delivery)
                    return;
                const distanceKm = haversineDistance(latitude, longitude, delivery.order.deliveryLat ?? 0, delivery.order.deliveryLng ?? 0);
                const etaMinutes = calculateETA(distanceKm);
                await prisma_1.prisma.tracking.create({
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
            }
            catch (err) {
                console.error("Erreur driver:location", err);
            }
        });
        socket.on("disconnect", () => {
            if (socket.role === "DRIVER" && socket.userId) {
                connectDrivers.delete(socket.userId);
            }
        });
    });
    return io;
}
function getIO() {
    if (!io)
        throw new Error("Socket.IO non initialisé");
    return io;
}
function notifyAvailableDrivers(orderId) {
    getIO().emit("order:new-available", { orderId });
}
function notifyOrderRoom(orderId, event, payload) {
    getIO().to(`order:${orderId}`).emit(event, payload);
}
