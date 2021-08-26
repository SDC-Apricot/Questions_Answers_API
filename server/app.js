const express = require('express');
const redis = require('redis');
const app = express();
const db = require('../postgres/index.js');
const getParameters = require('./helpers/getParameters.js');
const formatGetQuestionsResults = require('./helpers/formatGetQuestionsResults.js');
const formatGetAnswersResults = require('./helpers/formatGetAnswersResults.js');
const bodyParser = require('body-parser');
const loaderioToken = process.env.LOADER_IO_TOKEN;
const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;

app.use(bodyParser.json());

// redis set up
const client = redis.createClient({
  host: redis_host,
  port: redis_port
});
client.on('connect', function (err) {
  if (err) {
    console.log('Could not establish a connection with Redis. ' + err);
  } else {
    console.log('Connected to Redis successfully!');
  }
});


app.get(`/${loaderioToken}`, (req, res) => {
  res.send(loaderioToken);
  })

app.get('/qa/questions', (req,res) => {
  // extract parameters
  var parameters = getParameters(req.originalUrl);
  // if product_id is not included in the query respond with bad request (400)
  if (parameters.product_id === undefined) {
    res.status(400).send('product_id is not defined');
  }
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
              SELECT p.id, p.url
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
  ) d;
  `;

  var data = {
    product_id: parameters.product_id
  };
  
  try {
    client.get(`product_id: ${parameters.product_id}`, async (error, questions) => {
      if (error) {
        throw error;
      }
      if (questions) {
        var questions = JSON.parse(questions);
        data.results = questions.slice(parameters.startNumber, parameters.startNumber + parameters.count);
        res.status(200).send(data);
      } else {
        //query db
        db.query(query)
          .then((response) => {
            var questionsData = response.rows[0].array_to_json;
            var formattedQuestions = formatGetQuestionsResults(questionsData);
            // add set to cache
            client.set(`product_id: ${parameters.product_id}`, JSON.stringify(formattedQuestions));
            // set data.results to sliced questions array
            data.results = formattedQuestions.slice(parameters.startNumber, parameters.startNumber + parameters.count);
            res.status(200).send(data);
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          })
      }
    });
  } catch(error) {
    console.log(error);
    res.status(500).send(error);
  }
  
});

app.post('/qa/questions', (req, res) => {

  var query = `
  INSERT INTO qa_schema."questions"(question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
  VALUES (nextval('qa_schema.question_id_increment'), ${Number(req.body.product_id)}, '${req.body.body}', NOW(), '${req.body.name}', '${req.body.email}', false, 0);
  `;
  client.del(`product_id: ${req.body.product_id}`, (err, result) => {
    if (err) {
      console.log(err);
    }
  })

  db.query(query)
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
        SELECT p.id, p.url
        FROM qa_schema."photos" AS p
        WHERE  a.id = p.answers_id
        ) f
      ) as photos
    FROM qa_schema."answers" AS a
    WHERE a.question_id = ${parameters.question_id} AND a.reported = false
    ORDER BY a.id
    ) e;
  `;

  var data = {
    question: parameters.question_id,
    page: parameters.page,
    count: parameters.count,
    results: []
  };
  try {
    client.get(`question_id: ${parameters.question_id}`, async (error, answers) => {
      if (error) {
        throw error;
      }
      if (answers) {
        var answers = JSON.parse(answers);
        data.results = answers.slice(parameters.startNumber, parameters.startNumber + parameters.count);
        res.status(200).send(data);
      } else {
        db.query(query)
          .then((response) => {
            var answersData = response.rows[0].array_to_json;
            var formattedAnswers = formatGetAnswersResults(answersData);
            // add set to cache
            client.set(`question_id: ${parameters.question_id}`, JSON.stringify(formattedAnswers));
            // set data.results to sliced questions array
            data.results = formattedAnswers.slice(parameters.startNumber, parameters.startNumber + parameters.count);
            res.status(200).send(data);
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send(error);
          })
      }
    });
  } catch(error) {
    console.log(error);
    res.status(500).send(error);
  }
  
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
  
  var queryPhoto = `
  INSERT INTO qa_schema."photos"(id, answers_id, url)
  VALUES `;
  
  client.del(`question_id: ${parameters.question_id}`, (err, result) => {
    if (err) {
      console.log(err);
    }
  });

  db.query(queryAnswer)
    .then((response) => {
      var answer_id = Number(response.rows[0].id);
      for (var i = 0; i < req.body.photos.length; i++) {
        var currString = `(nextval('qa_schema.photo_id_increment'), ${answer_id}, '${req.body.photos[i]}')`;
        if (i === req.body.photos.length - 1) {
          queryPhoto = queryPhoto + currString + `;`;
        } else {
          queryPhoto = queryPhoto + currString + `, `;
        }
      };
      return db.query(queryPhoto);
    })
    .then((response) => {
      res.status(201).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })
});

app.put('/qa/questions/*/helpful', (req, res) => {

  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.question_id === undefined) {
    res.status(400).send('question_id is not defined');
  }

  var query = `
  UPDATE qa_schema."questions"
  SET question_helpfulness = ((SELECT question_helpfulness FROM qa_schema."questions" WHERE question_id=${parameters.question_id}) + 1)
  WHERE question_id=${parameters.question_id};`

  client.del(`question_id: ${parameters.question_id}`, (err, result) => {
    if (err) {
      console.log(err);
    }
  });

  db.query(query)
    .then((response) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })
});

app.put('/qa/questions/*/report', (req, res) => {
  
  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.question_id === undefined) {
    res.status(400).send('question_id is not defined');
  }

  var query = `
  UPDATE qa_schema."questions"
  SET reported = true
  WHERE question_id=${parameters.question_id};`

  client.del(`question_id: ${parameters.question_id}`, (err, result) => {
    if (err) {
      console.log(err);
    }
  })

  db.query(query)
    .then((response) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })

})

app.put('/qa/answers/*/helpful', (req, res) => {

  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.answer_id === undefined) {
    res.status(400).send('answer_id is not defined');
  }

  var query = `
  UPDATE qa_schema."answers"
  SET helpfulness = ((SELECT helpfulness FROM qa_schema."answers" WHERE id=${parameters.answer_id}) + 1)
  WHERE id=${parameters.answer_id};`

  db.query(query)
    .then((response) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })
})

app.put('/qa/answers/*/report', (req, res) => {
  
  // extract parameters
  var parameters = getParameters(req.originalUrl);

  // if question_id is not included in the query respond with bad request (400)
  if (parameters.answer_id === undefined) {
    res.status(400).send('answer_id is not defined');
  }

  var query = `
  UPDATE qa_schema."answers"
  SET reported = true
  WHERE id=${parameters.answer_id};`

  db.query(query)
    .then((response) => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).send(error);
    })

})

module.exports = app;