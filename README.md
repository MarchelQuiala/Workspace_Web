
# 🌍 SOS Lixo 

O **SOS Lixo** é uma plataforma colaborativa desenvolvida para ajudar no combate ao descarte irregular de lixo em Angola. O sistema permite que cidadãos denunciem áreas com lixo, enquanto empresas responsáveis pela recolha recebem notificações automáticas para agir rapidamente.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Setup Local](#-setup-local)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Contribuir](#-contribuindo)
- [Licença](#-licença)

---

## 🚀 Funcionalidades

- 📍 Registo de áreas com lixo
- 🗺️ Mapa interativo de ocorrências (`mapa.html`)
- 📸 Upload de imagens das áreas denunciadas
- 🔔 Sistema de notificações automáticas
- 📊 Painel administrativo para monitoramento (`ReportAdm.html`)
- ✅ Atualização do estado das ocorrências
- 📱 Interface responsiva para dispositivos móveis e desktop

---

## 🛠️ Tecnologias

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js (gerenciado via `server.js` e rotas)

### Database / Serviços
- Firebase Realtime Database (configurações na pasta `firebase`)

---

## 🔧 Setup Local

### Pré-requisitos
- Node.js (v16+)
- npm

### Passos para Instalação

1. Clone o repositório e aceda à pasta do projeto:
   ```bash
   cd WORKSPACE_WEB-MAIN

```

2. Instale as dependências do projeto:
```bash
npm install

```


3. Inicie o servidor local:
```bash
npm start

```


*(Ou `node server.js`, dependendo do script configurado no teu `package.json`)*
4. Abra no navegador:
* A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada no `server.js`).



---

## 📁 Estrutura do Projeto

```
WORKSPACE_WEB-MAIN/
├── .backup/               # Cópias de segurança do projeto
├── assets/                # Imagens, ícones e recursos estáticos
├── css/                   # Folhas de estilo (CSS)
├── firebase/              # Scripts de configuração e conexão com o Firebase
├── js/                    # Scripts JavaScript do lado do cliente
├── node_modules/          # Dependências instaladas pelo npm
├── routes/                # Rotas da aplicação (Backend / Express)
├── .gitignore             # Arquivos ignorados pelo Git
├── index.html             # Página inicial / Landing Page
├── login.html             # Página de autenticação de utilizadores
├── mapa.html              # Mapa interativo de ocorrências
├── package-lock.json      # Histórico detalhado das dependências
├── package.json           # Configurações do Node.js e scripts de execução
├── README.md              # Documentação do projeto
├── ReportAdm.html         # Painel administrativo / Relatórios
└── server.js              # Ponto de entrada do backend (Servidor Node.js)

```

---

## 🤝 Contribuindo

Se quiseres contribuir para o projeto, segue os passos abaixo:

1. Faz um **Fork** do projeto
2. Cria uma branch para a tua funcionalidade (`git checkout -b feature/NovaFuncionalidade`)
3. Sobe as tuas alterações (`git commit -m 'Adiciona NovaFuncionalidade'`)
4. Envia para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abre um **Pull Request**

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

### 🇦🇴 "Uma cidade limpa começa com a participação de todos."

```

---
### O que foi alterado:
1. **Estrutura do Projeto:** Removidos os blocos inexistentes `frontend/` e `backend/`. Agora reflete exatamente os ficheiros da árvore do VS Code (incluindo as páginas HTML soltas e o `server.js` na raiz).
2. **Setup Local Simplificado:** Como o projeto está unificado, o utilizador só precisa de rodar `npm install` e `npm start` uma única vez na raiz, tornando a instalação muito mais simples.
3. **Tecnologias:** Ajustado para focar no mapeamento das pastas reais (`firebase/` e `routes/`).

```