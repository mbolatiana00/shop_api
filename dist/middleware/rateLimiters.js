"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerifyLimiter = exports.otpSendLimiter = exports.loginLimiter = exports.registerLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const createLimiter = (windowMinutes, max, message) => (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
});
exports.registerLimiter = createLimiter(60, 10, "Trop d'inscriptions depuis cette adresse, réessayez plus tard");
exports.loginLimiter = createLimiter(15, 10, "Trop de tentatives de connexion, réessayez dans 15 minutes");
// Envoi de codes par email (renvoi OTP, mot de passe oublié)
exports.otpSendLimiter = createLimiter(15, 5, "Trop de demandes de code, réessayez dans 15 minutes");
// Saisie de codes (vérification compte, reset mot de passe)
exports.otpVerifyLimiter = createLimiter(15, 10, "Trop de tentatives, réessayez dans 15 minutes");
