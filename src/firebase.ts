import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

export const appConfig = {
  apiKey: 'AIzaSyDmNFu8BNPEriwbcmECY_tcpwyHuucDTds',
  authDomain: 'snake-on-roids.firebaseapp.com',
  databaseURL: 'https://snake-on-roids-default-rtdb.firebaseio.com',
  projectId: 'snake-on-roids',
  storageBucket: 'snake-on-roids.appspot.com',
  messagingSenderId: '10059391061',
  appId: '1:10059391061:web:3dbde474855b858e9c34dc',
  measurementId: 'G-DS993CPQRC',
};

if (!firebase.apps.length) {
  firebase.initializeApp(appConfig);
  firebase.analytics();
} else {
  firebase.app(); // if already initialized, use that one
}

export default firebase;
