// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
// Adicionado a importação do Auth via CDN
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3RsyyWzJ4oQy_9hd-bz4kQYbyEVc6qnU",
  authDomain: "sos-lixo.firebaseapp.com",
  projectId: "sos-lixo",
  storageBucket: "sos-lixo.firebasestorage.app",
  messagingSenderId: "610339766104",
  appId: "1:610339766104:web:7baadcb7ac2ed6ff60ef2d",
  measurementId: "G-W4DBDVMKY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa e exporta o serviço de Autenticação
const auth = getAuth(app);
export { auth };