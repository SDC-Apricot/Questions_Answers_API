const app = require('../server/app.js');
const { Client } = require('pg');
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
      .query(options)
      .expect(200)
      .then((response) => {
        dbResponse = response;
      })
      .catch((error) => {
        console.log(error);
      })
    // check that the response data contains a key with the product_id
    expect(dbResponse.body.product_id).toBe('28212');
    // check that the response data contains a key called result with an array
    expect(Array.isArray(dbResponse.body.results)).toBe(true);
    // check that the first question data matches the github api
    for (var key in apiResponse.data.results[0]) {
      expect(dbResponse.body.results[0]).toHaveProperty(key);
      if (key !== 'answers') {
        expect(dbResponse.body.results[0][key]).toMatch(apiResponse.data.results[0][key]);
      }
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
    expect(dbResponse.body.question_id).toBe('213337');
    // check that the response data contains a key called result with an array
    expect(Array.isArray(dbResponse.body.results)).toBe(true);
    // check that the first question data matches the github api
    for (var key in apiResponse.data.results[0]) {
      expect(dbResponse.body.results[0]).toHaveProperty(key);
      if (key !== 'photos') {
        expect(dbResponse.body.results[0][key]).toMatch(apiResponse.data.results[0][key]);
      }
    }
  })
})