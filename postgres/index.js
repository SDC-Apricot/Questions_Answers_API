const { Client } = require('pg');
require('dotenv').config();
const username = process.env.POSTGRES_USERNAME;
const password = process.env.POSTGRES_PASSWORD;

var connectionString = `postgres://${username}:${password}@localhost:5432/questions_answers`;

const client = new Client({
    connectionString: connectionString
});

var connect = async () => {
    await client.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('connected!');
        }
    });
};

connect();

module.exports = client;
