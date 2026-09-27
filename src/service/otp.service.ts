import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/token";

const OTP_TTL_MS = 10 * 60 * 1000;      // validité : 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;   // 1 minute entre deux renvois

export const generateOtpCode = () =>
  crypto.randomInt(100000, 1000000).toString(); // 6 chiffres

export const saveOtp = async (userId: number, code: string) => {
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const [, otp] = await prisma.$transaction([
    prisma.otpToken.deleteMany({ where: { userId } }),
    prisma.otpToken.create({
      data: { userId, code, used: false, expiresAt },
    }),
  ]);

  return otp;
};

// Vérification lors de la création du compte
export const verifyOtp = async (userId: number, code: string) => {
  const { count } = await prisma.otpToken.updateMany({
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

// Génère un NOUVEAU code (à envoyer ensuite par email)
export const resendOtp = async (userId: number) => {
  const last = await prisma.otpToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (last) {
    const elapsed = Date.now() - last.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new AppError(
        `Veuillez patienter ${wait}s avant de redemander un code`,
        429,
        "OTP_COOLDOWN"
      );
    }
  }

  const code = generateOtpCode();
  await saveOtp(userId, code);
  return code;
};