"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getMailerConfig = () => {
    const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
    const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT);
    const user = process.env.SMTP_USER || process.env.MAIL_USER || process.env.MAIL_USERNAME;
    const pass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.MAIL_PASSWORD;
    const fromAddress = process.env.SMTP_FROM_ADDRESS || process.env.MAIL_FROM_ADDRESS || user;
    const fromName = process.env.SMTP_FROM_NAME || process.env.MAIL_FROM_NAME || "Shop ";
    return {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        from: `${fromName} <${fromAddress}>`
    };
};
const transporter = nodemailer_1.default.createTransport(getMailerConfig());
const sendOtpEmail = async (email, code) => {
    const info = await transporter.sendMail({
        from: getMailerConfig().from,
        to: email,
        subject: "Votre code de vérification",
        text: `Votre code de vérification est : ${code}. Il expire dans 10 minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Vérification de votre compte</h2>
          <p>Voici votre code de vérification :</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
          <p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        </div>
      `,
    });
    console.log("OTP email accepted by SMTP", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
    });
};
exports.sendOtpEmail = sendOtpEmail;
const sendResetPasswordEmail = async (email, code) => {
    await transporter.sendMail({
        from: getMailerConfig().from,
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Votre code de réinitialisation est : ${code}. Il expire dans 10 minutes.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Voici votre code de réinitialisation :</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
          <p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe ne sera pas modifié.</p>
        </div>
      `,
    });
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
