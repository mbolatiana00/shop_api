import { Response } from "express";
import { AppError } from "../utils/token";

export const handleError = (
  res: Response,
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof AppError) {
    return res
      .status(error.status)
      .json({ message: error.message, code: error.code });
  }

  // Course rare : deux inscriptions simultanées avec le même email
  if ((error as { code?: string })?.code === "P2002") {
    return res
      .status(409)
      .json({ message: "Cet email est déjà utilisé", code: "EMAIL_TAKEN" });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ message: fallbackMessage });
};