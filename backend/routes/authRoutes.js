import express from 'express';
import {signup, login, googleAuth, verifyOtp, resendOtp} from "../controllers/authController.js";


const router = express.Router();

router.post("/signup", signup)
router.post("/verify-otp", verifyOtp)
router.post("/resend-otp", resendOtp)
router.post("/login", login)
router.post("/google", googleAuth)

export default router;
