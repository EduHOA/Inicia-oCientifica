require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); // Importando as rotas do usuário
const XLSX = require('xlsx'); // Importando a biblioteca XLSX
const User = require('./models/User'); // Importando o modelo de usuário

const app = express();
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// Rota para a API de usuários
app.use('/api/users', userRoutes);

// Rota para index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

// Rota para cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(__dirname + '/public/cadastro.html');
});

// Rota para quiz
app.get('/quiz', (req, res) => {
  res.sendFile(__dirname + '/public/pagDeQuiz.html');
});

app.get('/exportar', async (req, res) => {
  try {
    const users = await User.find();
    console.log('Número de usuários encontrados:', users.length);
    
    const data = users.map(user => ({
      Nome: user.nome,
      DataNascimento: user.dataNascimento,
      Emoções: user.emotions.join(', ') // Assegurando que pegamos o campo 'emotions'
    }));

    console.log('Dados a serem exportados:', data); // Log para verificar os dados

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');

    const filePath = `${__dirname}/Resultados_Emocoes.xlsx`;
    XLSX.writeFile(wb, filePath);

    res.download(filePath, err => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
        res.status(500).send('Erro ao enviar arquivo.');
      }
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).send('Erro ao exportar dados.');
  }
});

// Rota para deletar todos os usuários
app.delete('/deletar', async (req, res) => {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: 'Todos os usuários foram deletados com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuários.', error });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
