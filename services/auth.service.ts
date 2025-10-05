import admin from "firebase-admin";
import { readFileSync } from "fs";

export class AuthService {
    constructor() {
        const serviceAccount = JSON.parse(
            readFileSync("./serviceAccountKey.json", "utf8")
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
