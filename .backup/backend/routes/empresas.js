const express = require('express');
const router = express.Router();
const { db } = require('../server');

// Rota GET: Listar empresas parceiras cadastradas no sistema
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('empresas').get();
    const empresas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar empresas: " + err.message });
  }
});

// Rota POST: Adicionar uma nova empresa de recolha de resíduos urbanos
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, zona_atuacao } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios para registar uma empresa." });
    }

    const novaEmpresa = {
      nome,
      email,
      telefone: telefone || "",
      zona_atuacao: zona_atuacao || "Geral",
      data_cadastro: new Date()
    };

    const ref = await db.collection('empresas').add(novaEmpresa);
    res.status(201).json({ id: ref.id, ...novaEmpresa });
  } catch (err) {
    res.status(500).json({ error: "Erro ao adicionar empresa: " + err.message });
  }
});

module.exports = router;