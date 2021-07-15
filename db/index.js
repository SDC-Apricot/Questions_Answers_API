const { Client } = require('pg');
var connectionString = 'postgres://alizeh:password@localhost:5432/questions_answers';

const client = new Client({
    connectionString: connectionString
});