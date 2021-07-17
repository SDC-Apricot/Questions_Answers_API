const { MongoBulkWriteError } = require("mongodb");

conn = new Mongo();
db = conn.getDB('questions_answers');
