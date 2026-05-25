const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Rota GET: Listar dados de usuários (Útil para o painel administrativo)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários: " + err.message });
  }
});

// Rota POST: Salvar dados complementares do usuário logo após o cadastro no Frontend
router.post('/perfil', async (req, res) => {
  try {
    const { uid, nome, email, tipo } = req.body; // tipo: 'cidadao' ou 'empresa'

    if (!uid || !email) {
      return res.status(400).json({ error: "UID do Firebase e e-mail são obrigatórios." });
    }

    const novoUsuario = {
      nome: nome || "Utilizador Anónimo",
      email,
      tipo: tipo || "cidadao", 
      criado_em: new Date()
    };

    // Salva usando o próprio UID gerado pela autenticação do Firebase como ID do documento
    await db.collection('usuarios').doc(uid).set(novoUsuario);
    
    res.status(201).json({ uid, ...novoUsuario });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar perfil do usuário: " + err.message });
  }
});

module.exports = router;