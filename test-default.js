import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app); // default database

async function test() {
  try {
    await setDoc(doc(db, 'truckDetails', 'main'), { test: 1 });
    console.log("Success default");
  } catch (e) {
    console.error(e);
  }
}
test();
