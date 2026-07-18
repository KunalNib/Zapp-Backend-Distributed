import {Cart} from "../models/cartModel.js";
import { Product } from "../models/productModel.js";

export const getCart = async (req, res) => {
    try {
        const userId = req.id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
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
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const addToCart = async (req, res) => {
    try {
        const userId = req.id;
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found"
            })
        }

        //find user cart if there are already some items

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, quantity: 1, price: product.productPrice }],
                totalPrice: product.productPrice
            })
        }
        else {
            //Finding Existing product
            const index = cart.items.findIndex((item) => item.productId.toString() === productId);
            if (index > -1) {
                cart.items[index].quantity += 1;
            }
            else {
                cart.items.push({
                    productId: productId,
                    quantity: 1,
                    price: product.productPrice
                })
            }
            cart.totalPrice = cart.items.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            )
        }
        await cart.save();

        await cart.populate("items.productId");

        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
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

export const updateQuantity = async (req, res) => {
    try {
        const userId = req.id;
        const { productId, type } = req.body;
        let cart = await Cart.findOne({ userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        const item = cart.items.find((i) => i.productId._id.toString() === productId.toString());
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
        cart = await cart.populate("items.productId");
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
        const userId = req.id;
        const { productId } = req.body;
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found"
            })
        }
        cart.items = cart.items.filter(item => item.productId._id.toString() !== productId);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
        await cart.save();
        cart = await cart.populate("items.productId")

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