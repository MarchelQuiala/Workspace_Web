import { auth } from "./firebase.config.js";
// Corrigido para carregar via CDN oficial
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Monitora se o usuário está logado ou não
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está conectado
    console.log("Usuário ativo atual:", user.email);
    // Exiba o painel privado, mude telas, etc.
  } else {
    // Nenhum usuário conectado
    console.log("Nenhum usuário logado.");
    // Redirecione para a tela de login se tentar acessar área restrita
  }
});

// Adicionado 'export' para permitir o uso no HTML
export function deslogar() {
  signOut(auth).then(() => {
    alert("Desconectado com sucesso!");
  }).catch((error) => {
    console.error("Erro ao deslogar:", error);
  });
}