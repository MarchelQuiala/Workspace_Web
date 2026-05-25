// Corrigido o nome do arquivo de configuração de 'firebase.js' para 'firebase.config.js'
import { auth } from "./firebase.config.js";
// Corrigido para carregar via CDN oficial
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Adicionado 'export' para ser chamada pelo formulário no HTML
export function loginUsuario(email, senha) {
  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      // Login bem-sucedido
      const user = userCredential.user;
      console.log("Usuário logado:", user.email);
      // Aqui você pode redirecionar o usuário para a página restrita
    })
    .catch((error) => {
      const errorCode = error.code;
      
      if (errorCode === 'auth/invalid-credential') {
        alert("E-mail ou senha incorretos.");
      } else {
        console.error("Erro ao fazer login:", error.message);
      }
    });
}