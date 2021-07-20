const app = require('../server/app.js');
const { Client } = require('pg');
const supertest = require('supertest');
const { it } = require('jest-circus');
require('dotenv').config();

beforeAll((done) => {
  const username = process.env.POSTGRES_USERNAME;
  const password = process.env.POSTGRES_PASSWORD;
    
  var connectionString = `postgres://${username}:${password}@localhost:5432/questions_answers`;
  
  const client = new Client({
    connectionString: connectionString
  });
});

describe('GET questions', () => {
  it('response should be correctly formatted', async () => {
    const options = {};
    // TODO add call to existing api

    await supertest(app).get('/qa/questions', options)
      .expect(200)
      .then((response) => {
        // check that the response data contains a key with the product_id

        // check that the response data contains a key called result with an array
        
        // check that the first question data matches the github api
      })
  })
})