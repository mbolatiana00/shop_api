import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRoutes from "../routes/auth.route";
import notificationRoutes from "../routes/notification.route";
import restaurantRoutes from "../routes/restaurant.routes";
import orderRoutes from "../routes/order.route";
import paymentRoutes from "../routes/payment.route";
import trackingRoutes from "../routes/tracking.route";
import driverRoutes from "../routes/driver.route"
const app = express();


 app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/shop/auth", authRoutes);
app.use("/shop/notifications", notificationRoutes);
app.use("/shop/restaurants", restaurantRoutes)
app.use("/shop/orders", orderRoutes);
app.use("/shop/payments", paymentRoutes);
app.use("/shop/tracking", trackingRoutes);
app.use("/shop/driver", driverRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON invalide" });
  }
  console.error(err);
  return res.status(500).json({ message: "Erreur serveur" });
});

export default app;