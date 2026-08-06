import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    // origin: true
}))


// Register ONLY the webhook with raw body
app.use(
    "/api/v1/payment/webhook",
    express.raw({ type: "application/json" })
);

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

//Routes

import orderRoutes from "./routes/order.route.js";
import paymentRoutes from "./routes/payment.route.js";

app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

export default app;