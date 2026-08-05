import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true
        },
        products: [
            {
                product: {
                    
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],
        shippingAddress: {
            fullName: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            postalCode: Number
        },
        subTotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        shippingCharge: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 1
        },
        orderStatus: {
            type: String,
            enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled",],
            default: "Pending"
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded"],
            default: "Pending"
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        }
    },
    {timestamps: true}
)

export const Order = mongoose.model("Order", orderSchema);