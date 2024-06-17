import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyChPLp1VCbLTK-ArTpdFCd1pzKR4_IuheU",
    authDomain: "placement-training-management.firebaseapp.com",
    projectId: "placement-training-management",
    storageBucket: "placement-training-management.appspot.com",
    messagingSenderId: "161295457209",
    appId: "1:161295457209:web:dac207921b80c66d55b468",
    measurementId: "G-453ENPCH0P"
  };

  const app = initializeApp(firebaseConfig)
  export const database = getFirestore(app);
  export const auth = getAuth(app);
  export const storage = getStorage(app);
