"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const token_1 = require("../utils/token");
const handleError = (res, error, fallbackMessage) => {
    if (error instanceof token_1.AppError) {
        return res
            .status(error.status)
            .json({ message: error.message, code: error.code });
    }
    // Course rare : deux inscriptions simultanées avec le même email
    if (error?.code === "P2002") {
        return res
            .status(409)
            .json({ message: "Cet email est déjà utilisé", code: "EMAIL_TAKEN" });
    }
    console.error(fallbackMessage, error);
    return res.status(500).json({ message: fallbackMessage });
};
exports.handleError = handleError;
