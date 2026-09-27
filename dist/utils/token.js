"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.verifyToken = exports.signToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_secret = process.env.JWT_SECRET || "default_secret_key";
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, jwt_secret, { expiresIn: "1h" });
};
exports.generateToken = generateToken;
const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET manquant dans le .env");
    return secret;
};
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, getSecret(), {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d")
    });
};
exports.signToken = signToken;
const verifyToken = (token) => jsonwebtoken_1.default.verify(token, getSecret());
exports.verifyToken = verifyToken;
class AppError extends Error {
    constructor(message, status = 400, code) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.code = code;
    }
}
exports.AppError = AppError;
