import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const firebaseApp = (() => {
	if (getApps().length > 0) return getApps()[0];

	if (!process.env.FIREBASE_PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
		return null;
	}

	return initializeApp({
		credential: applicationDefault(),
		projectId: process.env.FIREBASE_PROJECT_ID,
	});
})();

export const firebaseMessaging = firebaseApp ? getMessaging(firebaseApp) : null;