const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

// Inicializa o Firebase Admin usando o ficheiro de chaves privadas
// Certifique-se de que o ficheiro 'key-firebase.json' está na raiz da pasta backend
const serviceAccount = require('.//firebase/keys/key-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "sos-lixo",

  storageBucket: "sos-lixo.firebasestorage.app" 
});

const db = admin.firestore();
// Cria uma referência para o serviço de Storage
const storage = admin.storage().bucket(); 

// Exporta o 'storage' junto com o db e o admin para as rotas usarem
module.exports = { db, admin, storage };

// Importa as rotas (deve ser feito DEPOIS de inicializar o Firebase Admin)
const empresasRoutes = require('./routes/empresas');
const ocorrenciasRoutes = require('./routes/ocorrencias');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Middlewares Globais
app.use(cors()); // Resolve o problema de bloqueio de requisições do navegador (CORS)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Disponibiliza a pasta de uploads de forma pública para o Frontend ver as imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Definição das Rotas da API
app.use('/api/empresas', empresasRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.send('API SOS Lixo está rodando perfeitamente!');
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor SOS Lixo ativo na porta ${PORT}`);
  console.log(`📬 API base: http://localhost:${PORT}`);
  console.log(`==================================================`);
});