import bcrypt from "bcryptjs";
import crypto from "crypto"
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/token";
import { generateOtpCode, saveOtp, verifyOtp, resendOtp } from "./otp.service";
import { sendOtpEmail, sendResetPasswordEmail } from "./mail.service";
import { notifyUserWelcome } from "./notification.service";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
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

export const registerUser = async (
  email: string,
  password: string,
  phone: string,
  name: string
) => {
  const normalizedEmail = normalizeEmail(email);

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError("Cet email est déjà utilisé", 409, "EMAIL_TAKEN");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashed,
      phone,
      name,
    },
  });

  const code = generateOtpCode();
  await saveOtp(user.id, code);
  await sendOtpEmail(user.email, code);
  await notifyUserWelcome(user.id, user.name);

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    message:
      "Utilisateur créé avec succès. Veuillez vérifier votre email pour le code de vérification.",
  };
};

export const verifyAccount = async (userId: number, code: string) => {
  const isValid = await verifyOtp(userId, code);
  if (!isValid) {
    throw new AppError("Code invalide ou expiré", 400, "OTP_INVALID");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
};

export const resendVerificationCode = async (userId: number) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404, "USER_NOT_FOUND");
  }
  if (user.isVerified) {
    throw new AppError("Compte déjà vérifié", 409, "ALREADY_VERIFIED");
  }

  const code = await resendOtp(userId); // nouveau code, avec délai entre deux renvois
  await sendOtpEmail(user.email, code);
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  const isMatch = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !isMatch) {
    throw new AppError("Email ou mot de passe incorrect", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isVerified) {
    throw new AppError(
      "Veuillez vérifier votre email avant de vous connecter",
      403,
      "EMAIL_NOT_VERIFIED"
    );
  }

  // On ne renvoie jamais le hash du mot de passe
  const { password: _password, ...safeUser } = user;
  return safeUser;
};


const RESET_TTL_MS = 10 * 60 * 1000;     // validité : 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;    // 1 minute entre deux demandes
const MAX_ATTEMPTS = 5;                  // essais max par code

const generateResetCode = () => crypto.randomInt(100000, 1000000).toString();

const hashCode = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// Étape 1 : demande du code.
// Ne lève aucune erreur si l'email n'existe pas (pas de fuite d'information).
export const requestPasswordReset = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) return;

  const last = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return; // trop tôt : on ne renvoie rien, réponse identique côté API
  }

  const code = generateResetCode();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashCode(code),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    }),
  ]);

  try {
    await sendResetPasswordEmail(user.email, code);
  } catch (error) {
    // On log sans faire échouer la requête, pour rester identique côté client
    console.error("Échec d'envoi de l'email de réinitialisation :", error);
  }
};

// Étape 2 : vérification du code + changement du mot de passe.
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  const invalid = () =>
    new AppError("Code invalide ou expiré", 400, "OTP_INVALID");

  const user = await findUserByEmail(email);
  if (!user) throw invalid();

  const token = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token) throw invalid();

  if (token.attempts >= MAX_ATTEMPTS) {
    throw new AppError(
      "Trop de tentatives. Veuillez demander un nouveau code",
      429,
      "OTP_TOO_MANY_ATTEMPTS"
    );
  }

  if (!safeEqual(token.tokenHash, hashCode(code))) {
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    // updateMany conditionnel : un même code ne peut servir qu'une fois
    const { count } = await tx.passwordResetToken.updateMany({
      where: { id: token.id, used: false },
      data: { used: true },
    });
    if (count === 0) throw invalid();

    await tx.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await tx.passwordResetToken.deleteMany({
      where: { userId: user.id, id: { not: token.id } },
    });
  });
};