FROM node:latest
WORKDIR /questions_answers_api
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_USER postgres
ENV POSTGRES_DB questions_answers
ENV POSTGRES_HOST postgres
ENV REDIS_HOST redis
ENV REDIS_PORT 6379
ENV LOADER_IO_TOKEN loaderio-ba42614c1c6b665c0123cd20f364f69b
COPY package*.json ./
RUN npm install
COPY server/* /questions_answers_api/server/
COPY server/helpers/* /questions_answers_api/server/helpers/
COPY postgres/index.js /questions_answers_api/postgres/
EXPOSE 5000
CMD ["npm", "start"]