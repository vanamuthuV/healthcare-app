import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// const serviceAccount = await import("../../../../serviceAccountKey.json", {
//   assert: {
//     type: "json",
//   },
// });

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

export { db };
