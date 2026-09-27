"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const token_1 = require("../utils/token");
const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentification requise" });
    }
    try {
        req.user = (0, token_1.verifyToken)(header.slice(7));
        return next();
    }
    catch {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
};
exports.authenticate = authenticate;
// Utilisation : router.get("/admin", authenticate, authorize("ADMIN"), handler)
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
    }
    return next();
};
exports.authorize = authorize;
