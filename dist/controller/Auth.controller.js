"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.forgotPassword = exports.me = exports.login = exports.resendOtp = exports.verifyOtp = exports.register = void 0;
const auth_service_1 = require("../service/auth.service");
const token_1 = require("../utils/token");
const errors_service_1 = require("../service/errors.service");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const register = async (req, res) => {
    try {
        const { email, password, phone, name } = req.body ?? {};
        if (!email || !password || !phone || !name) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires" });
        }
        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Email invalide" });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res
                .status(400)
                .json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
        }
        const result = await (0, auth_service_1.registerUser)(email, password, phone, name);
        return res.status(201).json({
            message: result.message,
            user: {
                id: result.userId,
                email: result.email,
                phone: result.phone,
                name: result.name,
            },
        });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de l'enregistrement de l'utilisateur");
    }
};
exports.register = register;
const verifyOtp = async (req, res) => {
    try {
        const userId = Number(req.body?.userId);
        const code = String(req.body?.code ?? "").trim();
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ message: "userId invalide" });
        }
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: "Le code doit contenir 6 chiffres" });
        }
        await (0, auth_service_1.verifyAccount)(userId, code);
        return res.status(200).json({ message: "Compte vérifié avec succès" });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de la vérification du code OTP");
    }
};
exports.verifyOtp = verifyOtp;
const resendOtp = async (req, res) => {
    try {
        const userId = Number(req.body?.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({ message: "userId invalide" });
        }
        await (0, auth_service_1.resendVerificationCode)(userId);
        return res.status(200).json({ message: "Nouveau code OTP envoyé avec succès" });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de l'envoi du nouveau code OTP");
    }
};
exports.resendOtp = resendOtp;
const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
            return res.status(400).json({ message: "Email et mot de passe obligatoires" });
        }
        const user = await (0, auth_service_1.loginUser)(email, password);
        const token = (0, token_1.signToken)({ id: user.id, role: user.role });
        return res.status(200).json({
            message: "Connexion réussie",
            token,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de la connexion");
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        const user = await (0, auth_service_1.findUserById)(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de la récupération du profil");
    }
};
exports.me = me;
const forgotPassword = async (req, res) => {
    try {
        const email = req.body?.email;
        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Email invalide" });
        }
        await (0, auth_service_1.requestPasswordReset)(email);
        // Même réponse que l'email existe ou non
        return res.status(200).json({
            message: "Si un compte existe avec cet email, un code de réinitialisation a été envoyé.",
        });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de la demande de réinitialisation");
    }
};
exports.forgotPassword = forgotPassword;
const resetPasswordController = async (req, res) => {
    try {
        const { email, newPassword } = req.body ?? {};
        const code = String(req.body?.code ?? "").trim();
        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ message: "Email invalide" });
        }
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: "Le code doit contenir 6 chiffres" });
        }
        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res
                .status(400)
                .json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
        }
        await (0, auth_service_1.resetPassword)(email, code, newPassword);
        return res
            .status(200)
            .json({ message: "Mot de passe réinitialisé avec succès" });
    }
    catch (error) {
        return (0, errors_service_1.handleError)(res, error, "Erreur lors de la réinitialisation du mot de passe");
    }
};
exports.resetPasswordController = resetPasswordController;
