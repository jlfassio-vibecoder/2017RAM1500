import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  projectId: "ai-workout-generator-hub"
});

const db = getFirestore(app, 'ai-studio-ram1500-a6aad1c3-783c-48e0-a179-f80c48018571');

async function test() {
  try {
    await db.collection('truckDetails').doc('main').set({ test: 'admin2' });
    const snap = await db.collection('truckDetails').doc('main').get();
    console.log("Admin write/read success!", snap.data());
  } catch (e) {
    console.error("Admin Error:", e);
  }
}
test();
