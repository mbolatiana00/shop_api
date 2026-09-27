"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_controller_1 = require("../controller/Auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiters_1 = require("../middleware/rateLimiters");
const router = (0, express_1.Router)();
// Inscription et vérification du compte
router.post("/register", rateLimiters_1.registerLimiter, Auth_controller_1.register);
router.post("/verify-otp", rateLimiters_1.otpVerifyLimiter, Auth_controller_1.verifyOtp);
router.post("/resend-otp", rateLimiters_1.otpSendLimiter, Auth_controller_1.resendOtp);
// Connexion
router.post("/login", rateLimiters_1.loginLimiter, Auth_controller_1.login);
// Mot de passe oublié
router.post("/forgot-password", rateLimiters_1.otpSendLimiter, Auth_controller_1.forgotPassword);
router.post("/reset-password", rateLimiters_1.otpVerifyLimiter, Auth_controller_1.resetPasswordController);
// Profil (protégé)
router.get("/me", auth_middleware_1.authenticate, Auth_controller_1.me);
exports.default = router;
