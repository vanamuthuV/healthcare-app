import admin from "firebase-admin";

const serviceAccount = await import("../../../../serviceAccountKey.json", {
  assert: {
    type: "json",
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount.default),
});

const db = admin.firestore();

export { db };
