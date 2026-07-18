import express from "express";
import { login,logout, register ,reVerify,verify,forgotPassword, verifyOtp, getAllUsers,getUserById, updateUser} from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router=express.Router();

router.post("/register",register);
router.post("/verify",verify);
router.post("/reverify",reVerify);
router.post("/login",login);
router.post("/logout",isAuthenticated,logout);
router.post("/forgot-password",forgotPassword);
router.post("/verify-otp/:email",verifyOtp);
// router.post("/change-password/:email",changePassword);
router.get('/all-user',isAuthenticated,isAdmin,getAllUsers);
router.get('/get-user/:userId', isAuthenticated, getUserById);
router.put('/update/:id',isAuthenticated,singleUpload,updateUser);

export default router;