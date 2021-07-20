const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/qa/questions', (req,res) => {
  // TODO
    //request contains:
    // product_id, page, count
    // respond with status code 200 + data

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