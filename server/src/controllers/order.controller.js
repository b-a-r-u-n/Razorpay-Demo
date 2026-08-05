import { Order } from "../models/order.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createOrder = asyncHandler(async (req, res) => {
    const {user, products, shippingAddress, subTotal, tax, shippingCharge, totalAmount} = req.body;

    // console.log(req.body);
    

    if((!user || user.length < 1) || (!products || products.length < 1) || (!shippingAddress || shippingAddress.length < 1) || !subTotal || !tax || !shippingCharge || !totalAmount)
        throw new apiError(400, "Something is missing");

    const order = await Order.create({
        user: user.name,
        products:  {
            product: products.product,
            quantity: products.quantity
        },
        shippingAddress,
        subTotal,
        tax,
        shippingCharge,
        totalAmount,
        orderStatus: "Pending",
        paymentStatus: "Pending"
    }) 

    if(!order)
        throw new apiError(400, "Error while creating order.");

    res
    .status(200)
    .json(
        new apiResponse(200, "Order created successfully.", order)
    )
})

export {createOrder}