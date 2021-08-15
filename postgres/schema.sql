CREATE SCHEMA [IF NOT EXISTS] qa_schema;

SET search_path TO qa_schema, public;

CREATE TABLE questions (
  question_id INTEGER NOT NULL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  question_body VARCHAR(1000),
  question_date TIMESTAMP WITH TIME ZONE,
  asker_name VARCHAR(60),
  asker_email VARCHAR(60),
  reported BOOLEAN,
  question_helpfulness INTEGER
);

CREATE TABLE answers (
  id INTEGER NOT NULL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(question_id),
  body VARCHAR(1000),
  date TIMESTAMP WITH TIME ZONE,
  answerer_name VARCHAR(60),
  answerer_email VARCHAR(60),
  reported BOOLEAN,
  helpfulness INTEGER
);

CREATE TABLE photos (
  id INTEGER NOT NULL PRIMARY KEY,
  answers_id INTEGER NOT NULL REFERENCES answers(id),
  url VARCHAR(200)
);

CREATE TEMP TABLE questionstemp (
  question_id INTEGER NOT NULL PRIMARY KEY,
  product_id INTEGER,
  question_body VARCHAR(1000),
  question_date BIGINT,
  asker_name VARCHAR(60),
  asker_email VARCHAR(60),
  reported BOOLEAN,
  question_helpfulness INTEGER
);

CREATE TEMP TABLE answerstemp (
  id INTEGER NOT NULL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body VARCHAR(1000),
  date BIGINT,
  answerer_name VARCHAR(60),
  answerer_email VARCHAR(60),
  reported BOOLEAN,
  helpfulness INTEGER
);

COPY questionstemp(question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
FROM '/Users/alizehrehman/Downloads/questions.csv'
DELIMITER ','
CSV HEADER;

COPY answerstemp(id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
FROM '/Users/alizehrehman/Downloads/answers.csv'
DELIMITER ','
CSV HEADER;

INSERT INTO questions(question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
SELECT question_id, product_id, question_body, to_timestamp(question_date/1000), asker_name, asker_email, reported, question_helpfulness
FROM questionstemp;

INSERT INTO answers(id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
SELECT id, question_id, body, to_timestamp(date/1000), answerer_name, answerer_email, reported, helpfulness
FROM answerstemp;

COPY photos(id, answers_id, url)
FROM '/Users/alizehrehman/Downloads/answers_photos.csv'
DELIMITER ','
CSV HEADER;

DROP TABLE questionstemp cascade;

DROP TABLE answerstemp cascade;

CREATE SEQUENCE question_id_increment
  AS INT
  START 3518964
  INCREMENT 1
  NO MAXVALUE
  OWNED BY questions.question_id;

CREATE SEQUENCE answer_id_increment
  AS INT
  START 6879307
  INCREMENT 1
  NO MAXVALUE
  OWNED BY answers.id;

CREATE SEQUENCE photo_id_increment
  AS INT
  START 2063760
  INCREMENT 1
  NO MAXVALUE
  OWNED BY photos.id;

CREATE INDEX idx_product_id_questions ON questions(product_id);
CREATE INDEX idx_question_id_questions ON questions(question_id);
CREATE INDEX idx_question_id_answers ON answers(question_id);
CREATE INDEX idx_id_answers ON answers(id);
CREATE INDEX idx_answers_id_photos ON photos(answers_id);