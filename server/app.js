const express = require('express');
const { forEach } = require('lodash');
const app = express();
const client = require('../postgresql/index.js');
const getParameters = require('./helpers/getParameters.js');

app.get('/qa/questions', (req,res) => {

  // extract parameters
  var parameters = getParameters(req.originalUrl);
  
  console.log('getParameters: ', getParameters);
  console.log('parameters: ', parameters);
  console.log('parameters.product_id: ', parameters.product_id);

  // if product_id is not included in the query respond with bad request (400)
  if (parameters.product_id === undefined) {
    console.log('in here');
    res.status(400).send('product_id is not defined');
  }
  
  // query db
  var query = `
    SELECT array_to_json(array_agg(row_to_json(d)))
    FROM (
      SELECT q.question_id, q.question_body, q.question_date, q.asker_name, q.question_helpfulness, q.reported,
        (
        SELECT array_to_json(array_agg(row_to_json(e)))
        FROM (
          SELECT a.id, a.body, a.date, a.answerer_name, a.helpfulness,
            (
            SELECT array_to_json(array_agg(row_to_json(f)))
            FROM (
              SELECT p.id, p.photo_url
              FROM qa_schema."photos" AS p
              WHERE  a.id = p.answers_id
              ) f
            ) as photos
          FROM qa_schema."answers" AS a
          WHERE q.question_id = a.question_id
          ) e
        ) as answers
      FROM qa_schema."questions" AS q
      WHERE product_id = ${parameters.product_id}
      ORDER BY q.question_id
      LIMIT ${parameters.count} OFFSET ${parameters.startNumber}
  ) d;
  `;

  var data = {
    product_id: parameters.product_id,
    results: []
  };
  
  console.log('query: ', query);

  client.query(query)
    .then((response) => {
      var questionsData = response.rows[0].array_to_json;
      console.log('questionsData: ', JSON.stringify(questionsData));
      forEach(questionsData, (question) => {
        var newAnswers = {};
        forEach(question.answers, (answer) => {
          if (answer.photos === null) {
            answer.photos = [];
          }
          newAnswers[answer.id] = answer;
        })
        question.answers = newAnswers;
        data.results.push(question);
      })
      console.log('data.results: ', data.results);
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send(error);
    })
})

app.post('/qa/questions', (req, res) => {
  // TODO
    // request contains:
    // body, name, email, product_id
    // respond with status code 201
})

app.get('/qa/questions/*/answers', (req,res) => {
    // TODO
      // request contains:
      // question_id, page, count
      // respond with status code 200 + data
    
})

app.post('/qa/questions/*/answers', (req, res) => {
  //TODO
    // request contains: * = question_id
    // body, name, email, photos
    // respond with status code 201 + data
})

app.put('qa/questions/*/helpful', (req, res) => {
  //TODO
    // response with status code 204
})

app.put('qa/questions/*/report', (req, res) => {
  //TODO
    // response with status code 204
})

app.put('qa/answers/*/helpful', (req, res) => {
  //TODO
    // response with status code 204
})

app.put('qa/answers/*/report', (req, res) => {
  //TODO
    // response with status code 204
})

module.exports = app;