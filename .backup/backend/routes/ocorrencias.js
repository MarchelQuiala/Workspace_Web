const express = require('express');
const router = express.Router();
const multer = require('multer');
// Importa o db, admin e o storage do server.js
const { db, admin, storage } = require('../server'); 

// Configuração do Multer para guardar temporariamente o arquivo na memória RAM antes do upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // Limite de 50MB (ideal para aceitar pequenos vídeos)
  },
  fileFilter: (req, file, cb) => {
    // Aceita imagens comuns e vídeos nos formatos MP4, MOV e QuickTime
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/mp4') || file.mimetype.startsWith('video/quicktime')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Apenas imagens e vídeos (.mp4, .mov) são permitidos.'));
    }
  }
});

// 1. Rota POST: Criar ocorrência recebendo Mídia (Foto ou Vídeo)
// O 'upload.single('midia')' captura o arquivo vindo do campo chamado "midia" no front-end
router.post('/', upload.single('midia'), async (req, res) => {
  try {
    const { usuarioId, descricao, latitude, longitude } = req.body;

    if (!usuarioId || !descricao || !latitude || !longitude) {
      return res.status(400).json({ error: "Campos obrigatórios em falta (ID, descrição ou coordenadas)." });
    }

    let urlMidia = "";

    // Se o utilizador enviou um arquivo (Foto ou Vídeo)
    if (req.file) {
      // Cria um nome único para o arquivo no Storage para não sobrescrever outros
      const nomeArquivo = `clean_city_${Date.now()}_${req.file.originalname}`;
      const arquivoFirebase = storage.file(nomeArquivo);

      // Envia o arquivo da memória para o Firebase Storage
      await arquivoFirebase.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype }
      });

      // Torna o arquivo público para que o mapa consiga exibir a foto/vídeo
      await arquivoFirebase.makePublic();

      // Gera a URL pública de acesso
      urlMidia = `https://storage.googleapis.com/${storage.name}/${nomeArquivo}`;
    }

    const localizacaoItem = new admin.firestore.GeoPoint(
      parseFloat(latitude), 
      parseFloat(longitude)
    );

    const novaOcorrencia = {
      usuarioId,
      descricao,
      localizacao: localizacaoItem,
      url_foto: urlMidia, // Guarda o link público da foto ou do vídeo aqui
      status: "Pendente",
      data_criacao: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('ocorrencias').add(novaOcorrencia);

    return res.status(201).json({
      message: "Ocorrência registada com sucesso com arquivo de mídia!",
      id: docRef.id,
      ...novaOcorrencia,
      localizacao: { latitude, longitude }
    });

  } catch (error) {
    console.error("Erro no processo de denúncia:", error);
    return res.status(500).json({ error: "Erro interno do servidor: " + error.message });
  }
});

// 2. Rota GET: Listar todas as denúncias activas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('ocorrencias').orderBy('data_criacao', 'desc').get();
    const ocorrencias = [];

    snapshot.forEach(doc => {
      const dados = doc.data();
      ocorrencias.push({
        id: doc.id,
        usuarioId: dados.usuarioId,
        descricao: dados.descricao,
        latitude: dados.localizacao ? dados.localizacao.latitude : null,
        longitude: dados.localizacao ? dados.localizacao.longitude : null,
        url_foto: dados.url_foto || "", // Contém o link da imagem ou do vídeo
        status: dados.status || "Pendente",
        data_criacao: dados.data_criacao ? dados.data_criacao.toDate() : null
      });
    });

    return res.status(200).json(ocorrencias);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao obter ocorrências: " + error.message });
  }
});

// 3. Rota PATCH: Mudar o status de uma denúncia
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { novoStatus } = req.body;

    if (!novoStatus) {
      return res.status(400).json({ error: "O novo estado não foi informado." });
    }

    await db.collection('ocorrencias').doc(id).update({ status: novoStatus });
    return res.status(200).json({ message: `Estado da ocorrência atualizado para '${novoStatus}'!` });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar estado: " + error.message });
  }
});

module.exports = router;