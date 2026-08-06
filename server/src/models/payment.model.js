import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        razorpayOrderId: {
            type: String,
            required: true
        },
        razorpayPaymentId: {
            type: String,
            default: null
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },
        paymentMethod: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["Created", "Captured", "Failed", "Refunded"],
            default: "Created"
        },
        refundId: {
            type: String,
            default: null
        },
        refundAmount: {
            type: Number,
            default: 0
        },
        gatewayResponse: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
)

export const Payment = mongoose.model("Payment", paymentSchema);