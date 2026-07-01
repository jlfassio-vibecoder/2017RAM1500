import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const d = await getDoc(doc(db, 'truckDetails', 'main'));
    console.log("Success read", d.data());
  } catch (e) {
    console.error(e);
  }
}
test();
