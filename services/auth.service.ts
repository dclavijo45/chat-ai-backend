import admin from "firebase-admin";
import { SERVICE_ACCOUNT_KEY_JSON } from "../config/auth.config";

export class AuthService {
    constructor() {
        const serviceAccount = JSON.parse(
            SERVICE_ACCOUNT_KEY_JSON
        );
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
    }

    /**
     * Verify the Firebase ID token
     * @param token - The Firebase ID token to verify
     */
    verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        return admin.auth().verifyIdToken(token);
    }
}
