const express = require('express');
const { forEach } = require('lodash');
const app = express();
const client = require('../db/index.js');

app.get('/qa/questions', (req,res) => {
  // TODO
    // request contains:
    // product_id, page, count
    // respond with status code 200 + data
  // extract parameters from query
  var indexOfParams = req.path.indexOf('?') + 1;
  var params = req.path.slice(indexOfParams);
  params = params.split('&');
  for (var i = 0; i < params.length; i++) {
    if (params[i].indexOf('product_id=') !== -1) {
      var product_id = Number(params[i].slice(11));
    } else if (params[i].indexOf('page=') !== -1) {
      var page = Number(params[i].slice(5));
    } else if (params[i].indexOf('count=') !== -1) {
      var count = Number(params[i].slice(6));
    }
  }
  // if product_id is not included in the query respond with bad request (400)
  if (product_id === undefined) {
    res.statusCode(400).send('product_id is not defined');
  }
  // set default values for page and count if not defined in query
  var page = page === undefined ? 1 : page;
  var count = count === undefined ? 5 : count;
  var startNumber = (page - 1) * count;
  // query db
  var responseData = {
    product_id: product_id,
    results: []
  }
  client.query(`SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported FROM questions WHERE product_id=${product_id} ORDER BY question_id LIMIT ${count} OFFSET ${startNumber}`)
    .then((questionData) => {
      console.log('questionData: ', questionData);
      responseData.results = questionData;
      // forEach(questionData, (question) => {
      //   question.answers = {};
      //   client.query(`SELECT id, body, date, answerer_name, helpfulness FROM answers WHERE question_id=${question.question_id}, reported=false`)
      //     .then((answerData) => {
      //       forEach(answerData, (answer) => {
      //         // need to change photo_url to url
      //         client.query(`SELECT id, photo_url FROM photos WHERE answers_id=${answer.id}`)
      //           .then((photoData) => {
      //             answer.photos = photoData;
      //             question.answers[answer.id] = answer;
      //           })
      //       })
      //     })
      //   responseData.results.push(question);
      // })
    })
    .catch((error) => {
      res.statusCode(500).send(error);
    })
  // send response
  res.statusCode(200).send(responseData);
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