// Corrigido o nome do arquivo de configuração para 'firebase.config.js'
import { auth } from "./firebase.config.js"; 
// Corrigido para carregar via CDN oficial
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Adicionado 'export' para permitir o uso na sua interface
export function cadastrarUsuario(email, senha) {
  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      // Cadastro realizado com sucesso
      const user = userCredential.user;
      console.log("Usuário cadastrado com sucesso:", user.uid);
      alert("Conta criada com sucesso!");
    })
    .catch((error) => {
      // Tratamento de erros comuns
      const errorCode = error.code;
      const errorMessage = error.message;
      
      if (errorCode === 'auth/email-already-in-use') {
        alert("Este e-mail já está sendo utilizado.");
      } else if (errorCode === 'auth/weak-password') { // Corrigido pequeno erro de digitação: era 'weak-senha', o correto do Firebase é 'weak-password'
        alert("A senha precisa ter pelo menos 6 caracteres.");
      } else {
        console.error("Erro no cadastro:", errorMessage);
      }
    });
}