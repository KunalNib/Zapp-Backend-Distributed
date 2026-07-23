import {Cart} from "../models/cartModel.js";
import { getGatewayUser } from "../utils/authContext.js";

import { getProductViaGrpc } from "../grpcClient.js";

export const getCart = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }
        const userId = authUser.id;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.json({
                success: true,
                cart: []
            })
        }
        return res.status(200).json({
            success: true,
            cart
        })

    }
    catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        })
    }
}

export const addToCart = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }
        const userId = authUser.id;
        const { productId } = req.body;

        const product = await getProductViaGrpc(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            })
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                items: [{
                    productId,
                    productName: product.productName,
                    productImg: product.productImg || [],
                    quantity: 1,
                    price: product.productPrice
                }],
                totalPrice: product.productPrice
            })
        }
        else {
            const index = cart.items.findIndex((item) => item.productId.toString() === productId);
            if (index > -1) {
                cart.items[index].quantity += 1;
            }
            else {
                cart.items.push({
                    productId: productId,
                    productName: product.productName,
                    productImg: product.productImg || [],
                    quantity: 1,
                    price: product.productPrice
                })
            }
            cart.totalPrice = cart.items.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            )
        }
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart:cart
        })


    }
    catch (error) {
        console.error("Crash inside addToCart:", error);
        return res.status(500).json({
            success: false,
            message: error.message + " - Stack: " + error.stack
        })
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }
        const userId = authUser.id;
        const { productId, type } = req.body;
        let cart = await Cart.findOne({ userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        const item = cart.items.find((i) => i.productId.toString() === productId.toString());
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item Not Found"
            })
        }
        if (type === "increase") {
            item.quantity += 1;
        }
        if (type === "decrease") {
            if (item.quantity > 1) item.quantity -= 1;
            else cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        }

        cart.totalPrice = cart.items.reduce((acc, item) =>
            acc + item.price * item.quantity, 0
        )
        await cart.save();
        return res.status(200).json({
            success: true,
            cart
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const authUser = getGatewayUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication context is missing"
            });
        }
        const userId = authUser.id;
        const { productId } = req.body;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
        await cart.save();

        return res.status(200).json({
            success: true,
            cart:cart
        })

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
