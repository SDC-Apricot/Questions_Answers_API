# Questions_Answers_API

A microservice for an e-commerce web application

## Description

The Questions and Answers API microservice consists of a PostgreSQL database, NGINX load balancer, two server instances, & a Redis cache. This microservice provides data including the questions that users have asked about a product for an e-commerce front-end, answers that have been provided for these questions, and any photographs that have been uploaded with each answer. 

## Getting Started

### Dependencies

The Questions and Answers API relies primarily on:

* Express
* PostgreSQL
* Redis
* NGINX
* Docker
* Jest
* SuperTest

### Installing

For Local Development in MacOS:
* From the root directory, install the following:

1. Download the Github repo:

```
git clone git@github.com/SDC-Apricot/Questions_Answers_API.git
```

2. Download NVM:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```
3. Install packages:
```
npm install
```

### Executing program

* To run locally using Docker in MacOS:

1. Download Docker Desktop using the instructions on https://docs.docker.com/desktop/mac/install/
2. From the root directory, run the following:
```
docker compose up
```

## Created By
Alizeh Rehman
