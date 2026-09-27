"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.loginUser = exports.resendVerificationCode = exports.verifyAccount = exports.registerUser = exports.findUserById = exports.findUserByEmail = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const token_1 = require("../utils/token");
const otp_service_1 = require("./otp.service");
const mail_service_1 = require("./mail.service");
const notification_service_1 = require("./notification.service");
const normalizeEmail = (email) => email.trim().toLowerCase();
const findUserByEmail = async (email) => {
    return prisma_1.prisma.user.findUnique({
        where: { email: normalizeEmail(email) },
    });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
    });
};
exports.findUserById = findUserById;
const registerUser = async (email, password, phone, name) => {
    const normalizedEmail = normalizeEmail(email);
    const existing = await (0, exports.findUserByEmail)(normalizedEmail);
    if (existing) {
        throw new token_1.AppError("Cet email est déjà utilisé", 409, "EMAIL_TAKEN");
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: normalizedEmail,
            password: hashed,
            phone,
            name,
        },
    });
    const code = (0, otp_service_1.generateOtpCode)();
    await (0, otp_service_1.saveOtp)(user.id, code);
    await (0, mail_service_1.sendOtpEmail)(user.email, code);
    await (0, notification_service_1.notifyUserWelcome)(user.id, user.name);
    return {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        message: "Utilisateur créé avec succès. Veuillez vérifier votre email pour le code de vérification.",
    };
};
exports.registerUser = registerUser;
const verifyAccount = async (userId, code) => {
    const isValid = await (0, otp_service_1.verifyOtp)(userId, code);
    if (!isValid) {
        throw new token_1.AppError("Code invalide ou expiré", 400, "OTP_INVALID");
    }
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
    });
};
exports.verifyAccount = verifyAccount;
const resendVerificationCode = async (userId) => {
    const user = await (0, exports.findUserById)(userId);
    if (!user) {
        throw new token_1.AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
    }
    if (user.isVerified) {
        throw new token_1.AppError("Compte déjà vérifié", 409, "ALREADY_VERIFIED");
    }
    const code = await (0, otp_service_1.resendOtp)(userId); // nouveau code, avec délai entre deux renvois
    await (0, mail_service_1.sendOtpEmail)(user.email, code);
};
exports.resendVerificationCode = resendVerificationCode;
const loginUser = async (email, password) => {
    const user = await (0, exports.findUserByEmail)(email);
    const isMatch = user ? await bcryptjs_1.default.compare(password, user.password) : false;
    if (!user || !isMatch) {
        throw new token_1.AppError("Email ou mot de passe incorrect", 401, "INVALID_CREDENTIALS");
    }
    if (!user.isVerified) {
        throw new token_1.AppError("Veuillez vérifier votre email avant de vous connecter", 403, "EMAIL_NOT_VERIFIED");
    }
    // On ne renvoie jamais le hash du mot de passe
    const { password: _password, ...safeUser } = user;
    return safeUser;
};
exports.loginUser = loginUser;
const RESET_TTL_MS = 10 * 60 * 1000; // validité : 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute entre deux demandes
const MAX_ATTEMPTS = 5; // essais max par code
const generateResetCode = () => crypto_1.default.randomInt(100000, 1000000).toString();
const hashCode = (code) => crypto_1.default.createHash("sha256").update(code).digest("hex");
const safeEqual = (a, b) => {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.length === bufB.length && crypto_1.default.timingSafeEqual(bufA, bufB);
};
// Étape 1 : demande du code.
// Ne lève aucune erreur si l'email n'existe pas (pas de fuite d'information).
const requestPasswordReset = async (email) => {
    const user = await (0, exports.findUserByEmail)(email);
    if (!user)
        return;
    const last = await prisma_1.prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
        return; // trop tôt : on ne renvoie rien, réponse identique côté API
    }
    const code = generateResetCode();
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma_1.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: hashCode(code),
                expiresAt: new Date(Date.now() + RESET_TTL_MS),
            },
        }),
    ]);
    try {
        await (0, mail_service_1.sendResetPasswordEmail)(user.email, code);
    }
    catch (error) {
        // On log sans faire échouer la requête, pour rester identique côté client
        console.error("Échec d'envoi de l'email de réinitialisation :", error);
    }
};
exports.requestPasswordReset = requestPasswordReset;
// Étape 2 : vérification du code + changement du mot de passe.
const resetPassword = async (email, code, newPassword) => {
    const invalid = () => new token_1.AppError("Code invalide ou expiré", 400, "OTP_INVALID");
    const user = await (0, exports.findUserByEmail)(email);
    if (!user)
        throw invalid();
    const token = await prisma_1.prisma.passwordResetToken.findFirst({
        where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
    });
    if (!token)
        throw invalid();
    if (token.attempts >= MAX_ATTEMPTS) {
        throw new token_1.AppError("Trop de tentatives. Veuillez demander un nouveau code", 429, "OTP_TOO_MANY_ATTEMPTS");
    }
    if (!safeEqual(token.tokenHash, hashCode(code))) {
        await prisma_1.prisma.passwordResetToken.update({
            where: { id: token.id },
            data: { attempts: { increment: 1 } },
        });
        throw invalid();
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.prisma.$transaction(async (tx) => {
        // updateMany conditionnel : un même code ne peut servir qu'une fois
        const { count } = await tx.passwordResetToken.updateMany({
            where: { id: token.id, used: false },
            data: { used: true },
        });
        if (count === 0)
            throw invalid();
        await tx.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });
        await tx.passwordResetToken.deleteMany({
            where: { userId: user.id, id: { not: token.id } },
        });
    });
};
exports.resetPassword = resetPassword;
