import express from 'express';
import { createOrder, getAllOrder, getMyOrder, getSalesData, getUserOrder, verifyPayment } from '../controllers/orderController.js';
const router=express.Router();

router.post("/create-order",createOrder)
router.post("/verify-payment",verifyPayment)
router.get("/user-order/:userId",getUserOrder)
router.get("/all-orders",getAllOrder)
router.get("/my-order",getMyOrder);
router.get('/sales',getSalesData)

export default router
