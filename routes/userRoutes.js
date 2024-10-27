const express = require('express');
const router = express.Router();
const User = require('../models/User');
const XLSX = require('xlsx'); // Importando a biblioteca XLSX

// Rota para armazenar os dados do usuário e suas emoções
router.post('/cadastro', async (req, res) => {
  const { nome, dataNascimento, emotions } = req.body; // Agora recebemos as emoções no cadastro

  try {
    // Criação do novo usuário com uma PK 'id' (gerada pelo Mongoose automaticamente)
    const user = new User({ nome, dataNascimento, emotions }); // Salvando as emoções junto com os dados do usuário
    await user.save();
    res.status(201).json({ message: 'Usuário salvo com sucesso!', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar usuário.', error });
  }
});

// Rota para armazenar a emoção do usuário (pode ser removida, se não precisar mais)
router.post('/:userId/emotions', async (req, res) => {
  const { userId } = req.params;
  const { emotion } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Log da emoção recebida
    console.log(`Emoção recebida para o usuário ${userId}: ${emotion}`);

    // Adiciona a emoção ao array 'emotions'
    user.emotions.push(emotion);
    await user.save();

    res.status(201).json({ message: 'Emoção salva com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar a emoção.', error });
  }
});

// Rota para exportar os dados
router.get('/exportar', async (req, res) => {
  try {
    const users = await User.find();
    console.log('Número de usuários encontrados:', users.length); // Verificando a quantidade de usuários
    const data = users.map(user => ({
      Nome: user.nome,
      DataNascimento: user.dataNascimento,
      Emoções: user.emotions.join(', '), // Adicionando as emoções
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

    const filePath = `${__dirname}/Resultados_Emocoes.xlsx`; // Ajustando o caminho
    XLSX.writeFile(wb, filePath);

    res.download(filePath, err => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err); // Log do erro
        res.status(500).send('Erro ao enviar arquivo.');
      }
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error); // Log do erro
    res.status(500).send('Erro ao exportar dados.');
  }
});

// Rota para deletar todos os usuários
router.delete('/deletar', async (req, res) => {
  console.log('Iniciando a deleção de todos os usuários...');
  try {
    const result = await User.deleteMany({});
    console.log('Usuários deletados:', result);
    res.status(200).json({ message: 'Todos os usuários foram deletados com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar usuários:', error);
    res.status(500).json({ message: 'Erro ao deletar usuários.', error });
  }
});


module.exports = router;
