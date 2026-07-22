import express from "express";
import { login,logout, register ,reVerify,verify,forgotPassword, verifyOtp, getAllUsers,getUserById, updateUser} from "../controllers/userController.js";
import { singleUpload } from "../middlewares/multer.js";

const router=express.Router();

router.post("/register",register);
router.post("/verify",verify);
router.post("/reverify",reVerify);
router.post("/login",login);
router.post("/logout",logout);
router.post("/forgot-password",forgotPassword);
router.post("/verify-otp/:email",verifyOtp);
// router.post("/change-password/:email",changePassword);
router.get('/all-user',getAllUsers);
router.get('/get-user/:userId', getUserById);
router.put('/update/:id',singleUpload,updateUser);

export default router;
