const { forEach } = require('lodash');

var formatGetQuestionsResults = (questionsData) => {
  var questions = [];
  forEach(questionsData, (question) => {
    var newAnswers = {};
    forEach(question.answers, (answer) => {
      if (answer.photos === null) {
        answer.photos = [];
      }
      newAnswers[answer.id] = answer;
    })
    question.answers = newAnswers;
    questions.push(question);
  });
  return questions;
}

module.exports = formatGetQuestionsResults;