import { Router } from "express";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  me,
  forgotPassword,
  resetPasswordController

} from "../controller/Auth.controller";

import { authenticate } from "../middleware/auth.middleware";
import {
  registerLimiter,
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiters";

const router = Router();

// Inscription et vérification du compte
router.post("/register", registerLimiter, register);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/resend-otp", otpSendLimiter, resendOtp);

// Connexion
router.post("/login", loginLimiter, login);

// Mot de passe oublié
router.post("/forgot-password", otpSendLimiter, forgotPassword);
router.post("/reset-password", otpVerifyLimiter, resetPasswordController);

// Profil (protégé)
router.get("/me", authenticate, me);

export default router;