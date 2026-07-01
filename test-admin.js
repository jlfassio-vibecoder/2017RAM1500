import admin from 'firebase-admin';

admin.initializeApp({
  projectId: "ai-workout-generator-hub"
});

const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-ram1500-a6aad1c3-783c-48e0-a179-f80c48018571' });

async function test() {
  try {
    await db.collection('truckDetails').doc('main').set({ test: 'admin' });
    const snap = await db.collection('truckDetails').doc('main').get();
    console.log("Admin write/read success!", snap.data());
  } catch (e) {
    console.error("Admin Error:", e);
  }
}
test();
