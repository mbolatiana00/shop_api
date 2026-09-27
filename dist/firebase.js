"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseMessaging = void 0;
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
const firebaseApp = (() => {
    if ((0, app_1.getApps)().length > 0)
        return (0, app_1.getApps)()[0];
    if (!process.env.FIREBASE_PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return null;
    }
    return (0, app_1.initializeApp)({
        credential: (0, app_1.applicationDefault)(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
})();
exports.firebaseMessaging = firebaseApp ? (0, messaging_1.getMessaging)(firebaseApp) : null;
