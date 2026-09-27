"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verifyOtp = exports.saveOtp = exports.generateOtpCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const token_1 = require("../utils/token");
const OTP_TTL_MS = 10 * 60 * 1000; // validité : 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute entre deux renvois
const generateOtpCode = () => crypto_1.default.randomInt(100000, 1000000).toString(); // 6 chiffres
exports.generateOtpCode = generateOtpCode;
const saveOtp = async (userId, code) => {
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    const [, otp] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.otpToken.deleteMany({ where: { userId } }),
        prisma_1.prisma.otpToken.create({
            data: { userId, code, used: false, expiresAt },
        }),
    ]);
    return otp;
};
exports.saveOtp = saveOtp;
// Vérification lors de la création du compte
const verifyOtp = async (userId, code) => {
    const { count } = await prisma_1.prisma.otpToken.updateMany({
        where: {
            userId,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
        data: { used: true },
    });
    return count > 0;
};
exports.verifyOtp = verifyOtp;
// Génère un NOUVEAU code (à envoyer ensuite par email)
const resendOtp = async (userId) => {
    const last = await prisma_1.prisma.otpToken.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    if (last) {
        const elapsed = Date.now() - last.createdAt.getTime();
        if (elapsed < RESEND_COOLDOWN_MS) {
            const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
            throw new token_1.AppError(`Veuillez patienter ${wait}s avant de redemander un code`, 429, "OTP_COOLDOWN");
        }
    }
    const code = (0, exports.generateOtpCode)();
    await (0, exports.saveOtp)(userId, code);
    return code;
};
exports.resendOtp = resendOtp;
