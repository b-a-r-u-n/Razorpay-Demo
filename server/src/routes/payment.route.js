import express from "express";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.route("/create-payment").post(createRazorpayOrder);
router.route("/verify-payment").post(verifyPayment);

export default router;