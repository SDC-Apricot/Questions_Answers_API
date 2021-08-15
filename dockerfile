FROM node:latest
WORKDIR /questions_answers_api
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_USER postgres
ENV POSTGRES_DB questions_answers
ENV POSTGRES_HOST postgres
COPY package*.json ./
RUN npm install
COPY server/* /questions_answers_api/server/
COPY server/helpers/* /questions_answers_api/server/helpers/
COPY postgres/index.js /questions_answers_api/postgres/
EXPOSE 5000
CMD ["npm", "start"]