import express from 'express';
import { isAdmin, isAuthenticated } from '../middlewares/isAuthenticated.js';
import { createOrder, getAllOrder, getMyOrder, getSalesData, getUserOrder, verifyPayment } from '../controllers/orderController.js';
const router=express.Router();

router.post("/create-order",isAuthenticated,createOrder)
router.post("/verify-payment",isAuthenticated,verifyPayment)
router.get("/user-order/:userId",isAuthenticated,isAdmin,getUserOrder)
router.get("/all-orders",isAuthenticated,isAdmin,getAllOrder)
router.get("/my-order",isAuthenticated,getMyOrder);
router.get('/sales',isAuthenticated,isAdmin,getSalesData)

export default router