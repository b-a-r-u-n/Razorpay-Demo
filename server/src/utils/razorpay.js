import Razorpay from "razorpay";
import crypto from "crypto";
import apiError from "./apiError.js";

const createRazorpay = async ({ totalAmount, currency, orderId }) => {
    try {
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_SECRET
        })

        let razorpayOrder = await instance.orders.create({
            amount: totalAmount * 100,
            currency: currency,
            receipt: orderId,
        })

        if (!razorpayOrder)
            throw new apiError(400, "Some error occured");

        return razorpayOrder;
    } catch (error) {
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
}

const verifyRazorpay = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    try {
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest("hex")

        if (!generated_signature)
            throw new apiError(400, "Some error occured while verify payment");

        return generated_signature === razorpaySignature;
    } catch (error) {
        throw new Error(`Failed to verify Razorpay payment: ${error.message}`);
    }
}

const getRazorpayPaymentDetails = async (razorpayPaymentId) => {
    try {
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET })

        const paymentDetails = await instance.payments.fetch(razorpayPaymentId)

        console.log(paymentDetails);
        

        return paymentDetails;
    } catch (error) {
        throw new apiError(
            400,
            `Error while getting payment details: ${error.message}`
        );
    }
}

const verifyWebhook = async (body, headers) => {

    const receivedSignature = headers["x-razorpay-signature"];

    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    return receivedSignature === generatedSignature;

    // if (receivedSignature !== generatedSignature) {
    //     throw new apiError(400, "Invalid webhook signature");
    // }
}

export { createRazorpay, verifyRazorpay, getRazorpayPaymentDetails, verifyWebhook };