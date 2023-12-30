const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    company_name: String,
    title: String,
    category: String,
    logoimage: String,
    mainimage: String,
    first_color: String,
    second_color: String,
  });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;