import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

initializeApp({
	credential: cert('jniasdjiasjnasasdadsiafsijn.json')
});

const firedb = getFirestore();

export {firedb}