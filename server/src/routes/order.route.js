import express from "express";
import { createOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.route("/").post(createOrder);

export default router;