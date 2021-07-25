const express = require('express');
const { forEach } = require('lodash');
const app = express();
const client = require('../postgresql/index.js');
const getParameters = require('./helpers/getParameters.js');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/qa/questions', (req,res) => {

  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if product_id is not included in the query respond with bad request (400)
  if (parameters.product_id === undefined) {
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
          WHERE q.question_id = a.question_id AND a.reported = false
          ) e
        ) as answers
      FROM qa_schema."questions" AS q
      WHERE product_id = ${parameters.product_id} AND q.reported = false
      ORDER BY q.question_id
      LIMIT ${parameters.count} OFFSET ${parameters.startNumber}
  ) d;
  `;

  var data = {
    product_id: parameters.product_id,
    results: []
  };

  client.query(query)
    .then((response) => {
      var questionsData = response.rows[0].array_to_json;
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
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send(error);
    })
})

app.post('/qa/questions', (req, res) => {

  var query = `
  INSERT INTO qa_schema."questions"(question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
  VALUES (nextval('qa_schema.question_id_increment'), ${Number(req.body.product_id)}, '${req.body.body}', NOW(), '${req.body.name}', '${req.body.email}', false, 0);
  `;

  client.query(query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((error) => {
      res.status(500).send(error);
    })
})

app.get('/qa/questions/*/answers', (req,res) => {

  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.question_id === undefined) {
    res.status(400).send('question_id is not defined');
  }

  var query = `
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
    WHERE a.question_id = ${parameters.question_id} AND a.reported = false
    ORDER BY a.id
    LIMIT ${parameters.count} OFFSET ${parameters.startNumber}
    ) e
  `

  var data = {
    question: parameters.question_id,
    page: parameters.page,
    count: parameters.count,
    results: []
  };
  
  client.query(query)
    .then((response) => {
      var answersData = response.rows[0].array_to_json;
      forEach(answersData, (answer) => {
        var id = answer.id;
        answer.answer_id = id;
        delete answer.id;
        if (answer.photos === null) {
          answer.photos = [];
        }
        data.results.push(answer);
      })
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).send(error);
    })
})

app.post('/qa/questions/*/answers', (req, res) => {
  //TODO
    // request contains: * = question_id
    // body, name, email, photos
    // respond with status code 201 + data

  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.question_id === undefined) {
    res.status(400).send('question_id is not defined');
  }

  var queryAnswer = `
  INSERT INTO qa_schema."answers"(id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
  VALUES (nextval('qa_schema.answer_id_increment'), ${parameters.question_id}, '${req.body.body}', NOW(), '${req.body.name}', '${req.body.email}', false, 0)
  RETURNING id;
  `;
  
  var answer_id, currUrl;
  
  var queryPhoto = `
  INSERT INTO qa_schema."photos"(id, answers_id, photo_url)
  VALUES `;

  client.query(queryAnswer)
    .then((response) => {
      console.log('Response: ', response);
      answer_id = Number(response.rows[0].id);
      for (var i = 0; i < req.body.photos.length; i++) {
        var currString = `(nextval('qa_schema.photo_id_increment'), ${answer_id}, '${req.body.photos[i]}')`;
        if (i === req.body.photos.length - 1) {
          queryPhoto = queryPhoto + currString + `;`;
        } else {
          queryPhoto = queryPhoto + currString + `, `;
        }
      };
      console.log('queryPhoto: ', queryPhoto);
      return client.query(queryPhoto);
    })
    .then((response) => {
      res.status(201).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })
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