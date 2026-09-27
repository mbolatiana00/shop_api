import { Response, NextFunction,Request } from "express";
import { AuthRequest } from "./auth.middleware";
import { request } from "http";

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    return next();
  };
};
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};

export const driverMiddleware = (
    request : Request,
    response : Response,
    next : NextFunction
) =>{

    const user = (request as any).user;
    if(!user){
      return response.status(401).json({message : "Non authorise"})
    }
    if (user.role !== "DRIVER" && user.role !== "ADMIN") {
      return response.status(403).json({message : "access denied, driver only"})
    }

    next()
}

export const clientMiddleware = (
  request : Request, 
  response: Response,
  next : NextFunction
) =>{

  const user = (request as any).user
  if(!user){
    return response.status(401).json({message : "Unauthorized"})
  }

  if(user.role !== "CLIENT" && user.role !== "ADMIN"){
    return response.status(403).json({message : "access denied. client only "})
  }
  next()
}