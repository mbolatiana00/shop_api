"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientMiddleware = exports.driverMiddleware = exports.adminMiddleware = exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        return next();
    };
};
exports.authorizeRoles = authorizeRoles;
const adminMiddleware = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const driverMiddleware = (request, response, next) => {
    const user = request.user;
    if (!user) {
        return response.status(401).json({ message: "Non authorise" });
    }
    if (user.role !== "DRIVER" && user.role !== "ADMIN") {
        return response.status(403).json({ message: "access denied, driver only" });
    }
    next();
};
exports.driverMiddleware = driverMiddleware;
const clientMiddleware = (request, response, next) => {
    const user = request.user;
    if (!user) {
        return response.status(401).json({ message: "Unauthorized" });
    }
    if (user.role !== "CLIENT" && user.role !== "ADMIN") {
        return response.status(403).json({ message: "access denied. client only " });
    }
    next();
};
exports.clientMiddleware = clientMiddleware;
