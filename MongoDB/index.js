const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db', {useNewUrlParser: true, useUnifiedTopology: true});

let questionsSchema = mongoose.Schema({
  question_id: Number,
  product_id: Number,
  question_body: String,
  question_date: {type: Date, default: Date.now}
  asker_name: String,
  asker_email: String,
  reported: Boolean,
  question_helpfulness: Number
});

let Question = mongoose.model('Question', questionsSchema);

let answersSchema = mongoose.Schema({
  id: Number,
  question_id: Number,
  body: String,
  date: {type: Date, default: Date.now},
  answerer_name: String,
  answerer_email: String,
  reported: Boolean,
  helpfulness: Number
});

let Answer = mongoose.model('Answer', answersSchema);

let photosSchema = mongoose.Schema({
  id: Number,
  answers_id: Number,
  photo_url: String
});

let Photo = mongoose.model('Photo', photosSchema);