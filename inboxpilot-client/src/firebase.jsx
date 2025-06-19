// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyC85_SEPZ7lEs7fEhXwCCAMMRvrueJORrI",
  authDomain: "authenticator-6360f.firebaseapp.com",
  projectId: "authenticator-6360f",
  storageBucket: "authenticator-6360f.appspot.com",
  messagingSenderId: "743704853772",
  appId: "1:743704853772:web:5bf17982ac39f94fa45d29",
  measurementId: "G-99ZRD0KELJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
 