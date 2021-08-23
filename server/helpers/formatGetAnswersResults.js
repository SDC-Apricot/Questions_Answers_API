const { forEach } = require('lodash');

var formatGetAnswersResults = (answersData) => {
    var answers = [];
    forEach(answersData, (answer) => {
        var id = answer.id;
        answer.answer_id = id;
        delete answer.id;
        if (answer.photos === null) {
            answer.photos = [];
        }
        answers.push(answer);
    })
    return answers;
}

module.exports = formatGetAnswersResults;