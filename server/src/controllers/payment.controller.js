import Razorpay from "razorpay";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createRazorpay, getRazorpayPaymentDetails, verifyRazorpay } from "../utils/razorpay.js";

const createRazorpayOrder = asyncHandler(async (req, res) => {
    // console.log("req.body", req.body);

    const { orderId } = req.body;

    if (!orderId)
        throw new apiError(404, "Order id not found.")

    const order = await Order.findById(orderId);

    if (!order)
        throw new apiError(404, "Order not found");
    

    const razorpayOrder = await createRazorpay({
        totalAmount: order.totalAmount,
        currency: "INR",
        orderId: order._id
    })

    // console.log(razorpayOrder);
    

    if (!razorpayOrder)
        throw new apiError(400, "Error while creating razorpay order.")

    res
        .status(200)
        .json(
            new apiResponse(200, "Razorpay order created successfully", { order, razorpayOrder })
        )
})

const verifyPayment = asyncHandler(async (req, res) => {
    // console.log(req.body);

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const verify = await verifyRazorpay({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
    })

    if (!verify)
        throw new apiError(200, "Razorpay verification failed.");

    const paymentDetails = await getRazorpayPaymentDetails(razorpay_payment_id)

    console.log(paymentDetails);


    const order = await Order.findById(orderId);

    if (!order)
        throw new apiError(200, "Order not found.");

    const payment = await Payment.create({
        user: order.user,
        order: order._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: order.totalAmount,
        currency: paymentDetails.currency,
        paymentMethod: paymentDetails.method,
        status: "Captured",
        gatewayResponse: paymentDetails
    })

    if(!payment)
        throw new apiError(400, "Payment not created.");

    order.orderStatus = "Confirmed";
    order.paymentStatus = "Paid";
    order.payment = payment._id;

    await order.save();


    res
        .status(200)
        .json(
            new apiResponse(200, "Payment verified successfully", payment)
        )
})

export { createRazorpayOrder, verifyPayment }