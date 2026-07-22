import { error } from "console";
import razorpayInstance from "../config/razorpay.js";

import { Order } from "../models/orderModel.js";
import crypto from 'crypto';
import User from "../models/userModel.js";
import { Product } from "../models/productModel.js";
import { getChannel } from '../utils/rabbitmq.js';
import { getGatewayUser } from "../utils/authContext.js";
export const createOrder = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }

        const { products, amount, tax, shipping, currency } = req.body;
        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`
        }
        const razorpayOrder = await razorpayInstance.orders.create(options)

        const newOrder = new Order({
            user: authUser.id,
            products,
            amount,
            tax,
            shipping,
            currency,
            status: "Pending",
            razorpayOrderId: razorpayOrder.id
        })

        await newOrder.save();

        res.status(200).json({
            success: true,
            order: razorpayOrder,
            dbOrder: newOrder
        })

    }
    catch (err) {
        console.error("Error in create Order:error");
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentFailed } = req.body;
        const userId = authUser.id;
        if (paymentFailed) {
            const order = await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: "Failed" }, { new: true });
            return res.status(400).json({
                success: false, message: "Payment Failed", order
            })
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString()).digest("hex");

        if (expectedSignature === razorpay_signature) {
            const order = await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: "Paid", razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }, { new: true })

            // Publish payment successful event
            const channel = getChannel();
            const exchange = 'order_exchange';
            await channel.assertExchange(exchange, 'topic', { durable: true });
            const eventPayload = JSON.stringify({ userId, orderId: order._id });
            channel.publish(exchange, 'order.payment.successful', Buffer.from(eventPayload));

            return res.status(200).json({
                success:true,
                message:"Payment Successfull",
                order
            })
        }
        else{
            const order = await Order.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: "Failed" }, { new: true });
            res.status(400).json({
                success: false, message: "Invalid Signature", order
            })

        }
    }
    catch (err) {
        console.error("Error in verify Payment:",err);
        res.status(500).json({
            success:false,
            message:err.message
        })
    }

}

export const getMyOrder=async(req,res)=>{
    try{
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }
        const userId=authUser.id;
        const orders=await Order.find({user:userId})
        .populate({path:"products.productId",select:"productName productPrice productImg"})
        .populate("user","firstName lastName email");

        return res.status(200).json({
            success:true,
            count:orders.length,
            orders
        })
    }
    catch(error){
        console.log("Error fetching user orders: ",error)
        return res.status(500).json({
                success:false,
                message:error.message
            }
        )
    }
}

export const getUserOrder=async(req,res)=>{
    try{
        const {userId}=req.params;
        const orders=await Order.find({user:userId})
        .populate({path:"products.productId",select:"productName productPrice productImg"})
        .populate("user","firstName lastName email");

        return res.status(200).json({
            success:true,
            count:orders.length,
            orders
        })
    }
    catch(error){
        console.log("Error fetching user orders: ",error)
        return res.status(500).json({
                success:false,
                message:error.message
            }
        )
    }
}



export const getAllOrder=async(req,res)=>{
    try{
        const orders=await Order.find({})
        .sort({createdAt:-1})
        .populate({path:"products.productId",select:"productName productPrice productImg"})
        .populate("user","firstName lastName email");

        return res.status(200).json({
            success:true,
            count:orders.length,
            orders
        })
    }
    catch(error){
        console.log("Error fetching user orders: ",error)
        return res.status(500).json({
                success:false,
                message:error.message
            }
        )
    }
}


export const getSalesData=async(req,res)=>{
    try{
        const totalUsers=await User.countDocuments({});
        const totalProducts=await Product.countDocuments({});
        const totalOrders=await Order.countDocuments({status:"Paid"});

        const totalSalesAgg= await Order.aggregate([
            {$match:{status:"Paid"}},
            {$group:{_id:null,total:{$sum:"$amount"}}}
        ])

        const totalSales= totalSalesAgg[0]?.total || 0;
        const thirtyDaysAgo =new Date();

        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
        const salesByDate=await Order.aggregate([
            {$match:{status:"Paid",createdAt:{$gte:thirtyDaysAgo}}},
            {
                $group:{
                    _id:{
                        $dateToString:{format:"%Y-%m-%d",date:"$createdAt"}
                    },
                    amount:{$sum:"$amount"}
                }
            }
            ,{
                    $sort:{_id:1}
                }
        ])

        console.log(salesByDate);
        const formattedSales=salesByDate.map((item)=>({
            date:item._id,
            amount:item.amount
        }))

        console.log(formattedSales);

        return res.json({
            success:true,
            totalUsers,
            totalProducts,
            totalOrders,
            totalSales,
            salesByDate:formattedSales
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({success:false,message:error.message})
    }
}
