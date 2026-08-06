import express from "express";
import { createRazorpayOrder, razorpayWebhook, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.route("/create-payment").post(createRazorpayOrder);
router.route("/verify-payment").post(verifyPayment);
router.route("/webhook").post(razorpayWebhook);

export default router;