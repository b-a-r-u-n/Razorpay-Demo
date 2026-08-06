import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createRazorpay, verifyRazorpay, verifyWebhook } from "../utils/razorpay.js";

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

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

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
        throw new apiError(400, "Razorpay verification failed.");

    // const paymentDetails = await getRazorpayPaymentDetails(razorpay_payment_id)

    // console.log(razorpay_payment_id);

    // console.log("paymentDetails", paymentDetails);

    // if (paymentDetails.status !== "captured") {
    //     throw new apiError(400, "Payment is not captured.");
    // }

    // const order = await Order.findOne({
    //     razorpayOrderId: razorpay_order_id
    // })

    // if (!order)
    //     throw new apiError(400, "Order not found.");

    // const existingPayment = await Payment.findOne({
    //     razorpayPaymentId: razorpay_payment_id
    // });

    // if (existingPayment) {
    //     return res.status(200).json(
    //         new apiResponse(200, "Payment already processed", existingPayment)
    //     );
    // }

    // const payment = await Payment.create({
    //     user: order.user,
    //     order: order._id,
    //     razorpayOrderId: razorpay_order_id,
    //     razorpayPaymentId: razorpay_payment_id,
    //     razorpaySignature: razorpay_signature,
    //     amount: paymentDetails.amount / 100,
    //     currency: paymentDetails.currency,
    //     paymentMethod: paymentDetails.method,
    //     status: "Captured",
    //     gatewayResponse: paymentDetails
    // })

    // if (!payment)
    //     throw new apiError(400, "Payment not created.");

    // order.orderStatus = "Confirmed";
    // order.paymentStatus = "Paid";
    // order.payment = payment._id;

    // await order.save();


    res
        .status(200)
        .json(
            new apiResponse(200, "Payment verified successfully", {})
        )
})

const razorpayWebhook = asyncHandler(async (req, res) => {
    // console.log("req.body", req.body);
    // console.log("req.header", req.header);
    // console.log("reg.body.string", req.body.toString());

    const verify = await verifyWebhook(req.body, req.headers);

    // console.log("verify", verify);

    if (!verify)
        throw new apiError(400, "Invalid webhook signature");

    const event = JSON.parse(req.body.toString());

    // console.log("event", event);
    // console.log("event.payload", event.payload.payment.entity);

    // console.log(event.payload.payment.entity.id);


    let order = await Order.findOne({
        razorpayOrderId: event.payload.payment.entity.order_id
    })

    if (!order)
        throw new apiError(404, "Order not found");


    let payment;
    let existingPayment;

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        switch (event.event) {
            case "payment.captured":

                existingPayment = await Payment.findOne(
                    {
                        razorpayPaymentId: event.payload.payment.entity.id
                    },
                    null,
                    {
                        session
                    }
                )

                if (existingPayment) {
                    await session.abortTransaction();

                    return res
                        .status(200)
                        .json(
                            new apiResponse(
                                200,
                                "Payment already processed",
                                existingPayment
                            )
                        );
                }

                payment = new Payment({
                    user: order.user,
                    order: order._id,
                    razorpayOrderId: event.payload.payment.entity.order_id,
                    razorpayPaymentId: event.payload.payment.entity.id,
                    amount: event.payload.payment.entity.amount / 100,
                    currency: event.payload.payment.entity.currency,
                    paymentMethod: event.payload.payment.entity.method,
                    status: "Captured",
                    gatewayResponse: {
                        payment: event.payload.payment.entity,
                        refund: null
                    }
                })

                await payment.save({ session });

                if (!payment)
                    throw new apiError(404, "Payment not found.");

                order.orderStatus = "Confirmed";
                order.paymentStatus = "Paid";
                order.payment = payment._id;

                await order.save({ session });

                break;

            case "payment.failed":

                existingPayment = await Payment.findOne(
                    {
                        razorpayPaymentId: event.payload.payment.entity.id
                    },
                    null,
                    {
                        session
                    }
                )

                if (existingPayment) {
                    await session.abortTransaction();

                    return res
                        .status(200)
                        .json(
                            new apiResponse(
                                200,
                                "Payment already processed",
                                existingPayment
                            )
                        );
                }

                payment = new Payment({
                    user: order.user,
                    order: order._id,
                    razorpayOrderId: event.payload.payment.entity.order_id,
                    razorpayPaymentId: event.payload.payment.entity.id,
                    amount: event.payload.payment.entity.amount / 100,
                    currency: event.payload.payment.entity.currency,
                    paymentMethod: event.payload.payment.entity.method,
                    status: "Failed",
                    gatewayResponse: {
                        payment: event.payload.payment.entity,
                        refund: null
                    }
                })

                await payment.save({ session });

                if (!payment)
                    throw new apiError(404, "Payment not found.");

                order.paymentStatus = "Failed";
                order.payment = payment._id;

                await order.save({ session });

                break;

            case "refund.processed":
                payment = await Payment.findOneAndUpdate(
                    {
                        razorpayPaymentId: event.payload.payment.entity.id,
                    },
                    {
                        $set: {
                            status: "Refunded",
                            refundId: event.payload.refund.entity.id,
                            refundAmount: event.payload.refund.entity.amount / 100,
                            "gatewayResponse.refund": event.payload.refund.entity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                )

                if (!payment)
                    throw new apiError(404, "Payment not found.");

                order.orderStatus = "Cancelled";
                order.paymentStatus = "Refunded";
                order.payment = payment._id;

                await order.save({ session });

                break;

            default:
                return res.status(200).send("Ignored");

        }

        await session.commitTransaction();

    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    res
        .status(200)
        .json(
            new apiResponse(200, "payment received.")
        )
})

export { createRazorpayOrder, verifyPayment, razorpayWebhook }