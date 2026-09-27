import { Request, Response } from "express";
import {
  registerUser,
  verifyAccount,
  resendVerificationCode,
  loginUser,
  findUserById,
  requestPasswordReset,
  resetPassword
} from "../service/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { signToken } from "../utils/token";
import { handleError } from "../service/errors.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response) => {
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

    const result = await registerUser(email, password, phone, name);

    return res.status(201).json({
      message: result.message,
      user: {
        id: result.userId,
        email: result.email,
        phone: result.phone,
        name: result.name,
      },
    });
  } catch (error) {
    return handleError(res, error, "Erreur lors de l'enregistrement de l'utilisateur");
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body?.userId);
    const code = String(req.body?.code ?? "").trim();

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalide" });
    }
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Le code doit contenir 6 chiffres" });
    }

    await verifyAccount(userId, code);

    return res.status(200).json({ message: "Compte vérifié avec succès" });
  } catch (error) {
    return handleError(res, error, "Erreur lors de la vérification du code OTP");
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body?.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ message: "userId invalide" });
    }

    await resendVerificationCode(userId);

    return res.status(200).json({ message: "Nouveau code OTP envoyé avec succès" });
  } catch (error) {
    return handleError(res, error, "Erreur lors de l'envoi du nouveau code OTP");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    const user = await loginUser(email, password);
    const token = signToken({ id: user.id, role: user.role });

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
  } catch (error) {
    return handleError(res, error, "Erreur lors de la connexion");
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return handleError(res, error, "Erreur lors de la récupération du profil");
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body?.email;

    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: "Email invalide" });
    }

    await requestPasswordReset(email);

    // Même réponse que l'email existe ou non
    return res.status(200).json({
      message:
        "Si un compte existe avec cet email, un code de réinitialisation a été envoyé.",
    });
  } catch (error) {
    return handleError(res, error, "Erreur lors de la demande de réinitialisation");
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
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

    await resetPassword(email, code, newPassword);

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    return handleError(res, error, "Erreur lors de la réinitialisation du mot de passe");
  }
};