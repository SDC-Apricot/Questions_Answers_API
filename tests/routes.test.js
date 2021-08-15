const app = require('../server/app.js');
const client = require('../postgres/index.js');
const supertest = require('supertest');
const axios = require('axios');
const port = 5000;
require('dotenv').config();

beforeAll(() => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
})

describe('GET questions', () => {
  it('response should be correctly formatted', async () => {
    const options = {product_id: 28212};
    var dbResponse;
    var apiResponse;

    axios({
      headers: {
        Authorization: process.env.GITHUB_API_KEY
      },
      method: 'get',
      params: options,
      url: `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rpp/qa/questions`
    })
      .then((response) => {
        apiResponse = response;
      })
      .catch((error) => {
        console.log(error);
      })

    await supertest(app)
      .get('/qa/questions')
      .expect(200)
      .query(options)
      .then((response) => {
        dbResponse = response;
      })
      .catch((error) => {
        console.log(error);
      })
    // check that the response data contains a key with the product_id
    expect(dbResponse.body.product_id).toBe(28212);
    // check that the response data contains a key called result with an array
    expect(Array.isArray(dbResponse.body.results)).toBe(true);
    // check that the first question data has the same keys as the github api
    for (var key in apiResponse.data.results[0]) {
      expect(dbResponse.body.results[0]).toHaveProperty(key);
    }
  })
})

describe('GET answers', () => {
  it('response is formatted correctly', async () => {
    var dbResponse;
    var apiResponse;

    axios({
      headers: {
        Authorization: process.env.GITHUB_API_KEY
      },
      method: 'get',
      url: `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rpp/qa/questions/213337/answers`
    })
      .then((response) => {
        apiResponse = response;
      })
      .catch((error) => {
        console.log(error);
      })

    await supertest(app)
      .get('/qa/questions/213337/answers')
      .expect(200)
      .then((response) => {
        dbResponse = response;
      })
      .catch((error) => {
        console.log(error);
      })
    // check that the response data contains a key with the product_id
    expect(dbResponse.body.question).toBe(213337);
    // check that the response data contains a key called result with an array
    expect(Array.isArray(dbResponse.body.results)).toBe(true);
    // check that the first question data matches the github api
    for (var key in apiResponse.data.results[0]) {
      expect(dbResponse.body.results[0]).toHaveProperty(key);
    }
  })
})

describe('POST question', () => {
  it('question is added to the db', async () => {
    var rowsBefore = await client.query(`SELECT COUNT(*) FROM qa_schema."questions" WHERE product_id=28212;`);

    var options = {
      body: 'TEST: adding question',
      name: 'alizeh',
      email: 'alizeh@abc.com',
      product_id: '28212'
    }
    await supertest(app)
    .post('/qa/questions')
    .send(options)
    .expect(201)
    .then((data) => {
    })
    .catch((error) => {
      console.log(error);
    })
    
    var rowsAfter = await client.query(`SELECT COUNT(*) FROM qa_schema."questions" WHERE product_id=28212;`);
    
    expect(Number(rowsAfter.rows[0].count)).toBe(Number(rowsBefore.rows[0].count) + 1);
  })
})

describe('POST answer', () => {
  it('answer is added to the db', async () => {
    var rowsBefore = await client.query(`SELECT COUNT(*) FROM qa_schema."answers" WHERE question_id=3518964;`);
    var photosCountBefore = await client.query(`SELECT COUNT(*) FROM qa_schema."photos";`);

    var options = {
      body: 'TEST: adding answer',
      name: 'alizeh',
      email: 'alizeh@abc.com',
      photos: [
        'http://abcd.com',
        'http://efgh.com'
      ]
    }
    await supertest(app)
    .post('/qa/questions/3518964/answers')
    .send(options)
    .expect(201)
    .then((data) => {
    })
    .catch((error) => {
      console.log(error);
    })
    
    var rowsAfter = await client.query(`SELECT COUNT(*) FROM qa_schema."answers" WHERE question_id=3518964;`);
    var photosCountAfter = await client.query(`SELECT COUNT(*) FROM qa_schema."photos";`);

    expect(Number(rowsAfter.rows[0].count)).toBe(Number(rowsBefore.rows[0].count) + 1);
    expect(Number(photosCountAfter.rows[0].count) - Number(photosCountBefore.rows[0].count)).toBe(2);
  })
})

describe('PUT question', () => {
  it('adds 1 to the helpfulness score', async () => {
    var helpfulnessBefore = await client.query(`SELECT question_helpfulness FROM qa_schema."questions" WHERE question_id=3518964;`);

    await supertest(app)
    .put('/qa/questions/3518964/helpful')
    .send({})
    .expect(204)
    .then((data) => {
    })
    .catch((error) => {
      console.log(error);
    })
    
    var helpfulnessAfter = await client.query(`SELECT question_helpfulness FROM qa_schema."questions" WHERE question_id=3518964;`);

    expect(Number(helpfulnessAfter.rows[0].question_helpfulness)).toBe(Number(helpfulnessBefore.rows[0].question_helpfulness) + 1);
  })
  
  it('marks question as true for reported', async () => {
    
    await supertest(app)
    .put('/qa/questions/3518964/report')
    .send({})
    .expect(204)
    .catch((error) => {
      console.log(error);
    })

    var reported = await client.query(`SELECT reported FROM qa_schema."questions" WHERE question_id=3518964;`);

    expect(reported).toBeTruthy();
  })
})

describe('PUT answer', () => {
  it('adds 1 to the helpfulness score', async () => {
    var helpfulnessBefore = await client.query(`SELECT helpfulness FROM qa_schema."answers" WHERE id=6879307;`);

    await supertest(app)
    .put('/qa/answers/6879307/helpful')
    .send({})
    .expect(204)
    .then((data) => {
    })
    .catch((error) => {
      console.log(error);
    })
    
    var helpfulnessAfter = await client.query(`SELECT helpfulness FROM qa_schema."answers" WHERE id=6879307;`);

    expect(Number(helpfulnessAfter.rows[0].helpfulness)).toBe(Number(helpfulnessBefore.rows[0].helpfulness) + 1);
  })

  it('marks answer as true for reported', async () => {
    
    await supertest(app)
    .put('/qa/answers/6879307/report')
    .send({})
    .expect(204)
    .catch((error) => {
      console.log(error);
    })

    var reported = await client.query(`SELECT reported FROM qa_schema."answers" WHERE id=6879307;`);

    expect(reported).toBeTruthy();
  })
})