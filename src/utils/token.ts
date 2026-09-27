import jwt from "jsonwebtoken";

const jwt_secret = process.env.JWT_SECRET || "default_secret_key";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, jwt_secret, { expiresIn : "1h" });
};

export type JwtPayload = { id: number; role: string };

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET manquant dans le .env");
  return secret;
};

export const signToken = (payload : JwtPayload)=>{
  return jwt.sign(payload, getSecret(),{
        expiresIn : (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"]
    })
}
export const verifyToken = (token: string) =>
    jwt.verify(token, getSecret()) as JwtPayload;

export class AppError extends Error {
    public status: number;
    public code?: string;
  
    constructor(message: string, status = 400, code?: string) {
      super(message);
      this.name = "AppError";
      this.status = status;
      this.code = code;
    }
  }