import express from "express";
import { addToCart, getCart, removeFromCart, updateQuantity } from "../controllers/cartController.js";

const router = express.Router();

router.get("/",getCart);
router.post("/add",addToCart);
router.put("/update",updateQuantity)
router.delete("/remove",removeFromCart);

export default router;
