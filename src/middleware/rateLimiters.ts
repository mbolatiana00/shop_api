import rateLimit from "express-rate-limit";


const createLimiter = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

export const registerLimiter = createLimiter(
  60,
  10,
  "Trop d'inscriptions depuis cette adresse, réessayez plus tard"
);

export const loginLimiter = createLimiter(
  15,
  10,
  "Trop de tentatives de connexion, réessayez dans 15 minutes"
);

// Envoi de codes par email (renvoi OTP, mot de passe oublié)
export const otpSendLimiter = createLimiter(
  15,
  5,
  "Trop de demandes de code, réessayez dans 15 minutes"
);

// Saisie de codes (vérification compte, reset mot de passe)
export const otpVerifyLimiter = createLimiter(
  15,
  10,
  "Trop de tentatives, réessayez dans 15 minutes"
);