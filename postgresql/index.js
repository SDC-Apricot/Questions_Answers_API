const { Client } = require('pg');
require('dotenv').config();
const username = process.env.POSTGRES_USERNAME;
const password = process.env.POSTGRES_PASSWORD;

var connectionString = `postgres://${username}:${password}@localhost:5432/questions_answers`;

const client = new Client({
    connectionString: connectionString
});

client.connect();
