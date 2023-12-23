
import "firebase/firestore";
import "firebase/auth";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/app";
import { initializeFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBK1yCBaNpOJQdhmXz3faZrgEhhlHIvOSo",
  authDomain: "final-dc385.firebaseapp.com",
  projectId: "final-dc385",
  storageBucket: "final-dc385.appspot.com",
  messagingSenderId: "521402547094",
  appId: "1:521402547094:web:ef6cabda3b718455883bb7"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app,{
  experimentalForceLongPolling:true,
})

export { firebase,db };