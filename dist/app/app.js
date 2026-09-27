"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("../routes/auth.route"));
const notification_route_1 = __importDefault(require("../routes/notification.route"));
const restaurant_routes_1 = __importDefault(require("../routes/restaurant.routes"));
const order_route_1 = __importDefault(require("../routes/order.route"));
const payment_route_1 = __importDefault(require("../routes/payment.route"));
const tracking_route_1 = __importDefault(require("../routes/tracking.route"));
const driver_route_1 = __importDefault(require("../routes/driver.route"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/shop/auth", auth_route_1.default);
app.use("/shop/notifications", notification_route_1.default);
app.use("/shop/restaurants", restaurant_routes_1.default);
app.use("/shop/orders", order_route_1.default);
app.use("/shop/payments", payment_route_1.default);
app.use("/shop/tracking", tracking_route_1.default);
app.use("/shop/driver", driver_route_1.default);
app.use((_req, res) => {
    res.status(404).json({ message: "Route introuvable" });
});
app.use((err, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ message: "JSON invalide" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
});
exports.default = app;
