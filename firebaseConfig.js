// Replace the config object with your Firebase project's config
import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider, signInWithPopup} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBSFSakiScXzL73mSNfe6HqeK2PygJq1Hw",
  authDomain: "choreswap-318d9.firebaseapp.com",
  projectId: "choreswap-318d9",
  storageBucket: "choreswap-318d9.firebasestorage.app",
  messagingSenderId: "144100275671",
  appId: "1:144100275671:web:fbc3f84c0e58382cc2c792",
  measurementId: "G-M8BL7V39VX"
};

const app = initializeApp(firebaseConfig);
export default app;

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export const storage = getStorage(app);
