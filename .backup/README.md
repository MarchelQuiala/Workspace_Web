# 🌍 SOS Lixo 

O **SOS Lixo** é uma plataforma colaborativa desenvolvida para ajudar no combate ao descarte irregular de lixo em Angola. O sistema permite que cidadãos denunciem áreas com lixo, enquanto empresas responsáveis pela recolha recebem notificações automáticas para agir rapidamente.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Setup](#-setup-local)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Contribuir](#-contribuindo)
- [Licença](#-licença)

---

## 🚀 Funcionalidades

- 📍 Registo de áreas com lixo
- 🗺️ Mapa interativo de ocorrências
- 📸 Upload de imagens das áreas denunciadas
- 🔔 Sistema de notificações automáticas
- 📊 Painel administrativo para monitoramento
- ✅ Atualização do estado das ocorrências
- 📱 Interface responsiva para dispositivos móveis e desktop

---

## 🛠️ Tecnologias

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- Firebase Realtime Database

---

## 🔧 Setup Local

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn
- Conta Firebase

### Backend

\`\`\`bash
cd backend
npm install
cp ../.env.example ../.env
# Editar .env com suas credenciais Firebase
npm start
# API rodará em http://localhost:5000
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm install
npm start
# Aplicação rodará em http://localhost:3000
\`\`\`

---

## 📁 Estrutura do Projeto

\`\`\`
agents-organizing-professional-docs/
├── frontend/                 # Aplicação Frontend
│   ├── public/              # Arquivos estáticos
│   ├── src/                 # Código-fonte
│   │   ├── assets/          # Imagens e recursos
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas principais
│   │   ├── styles/          # CSS/Estilos
│   │   └── js/              # JavaScript utilities
│   └── package.json
├── backend/                 # API Backend
│   ├── src/                 # Código-fonte
│   │   ├── routes/          # Rotas da API
│   │   ├── config/          # Configurações
│   │   ├── middleware/      # Middlewares
│   │   └── utils/           # Funções utilitárias
│   ├── server.js            # Entry point
│   └── package.json
├── docs/                    # Documentação
├── uploads/                 # Arquivos enviados
├── .env.example             # Exemplo de variáveis de ambiente
├── .gitignore
├── README.md
└── CONTRIBUTING.md
\`\`\`

---

## 🤝 Contribuindo

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de contribuição.

### Passos Rápidos

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

### 🇦🇴 "Uma cidade limpa começa com a participação de todos."
