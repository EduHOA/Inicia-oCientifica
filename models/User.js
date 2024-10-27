const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importando o mongoose-sequence

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  dataNascimento: {
    type: Date,
    required: true
  },
  emotions: {
    type: [String], // Array de strings para armazenar as emoções
    default: []
  }
});

// Aplicar o auto-incremento ao campo 'id'
userSchema.plugin(AutoIncrement, { inc_field: 'id' });

// Criação do modelo
const User = mongoose.model('User', userSchema);

module.exports = User;
