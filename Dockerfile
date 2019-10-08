FROM node:12-stretch

COPY . /code
WORKDIR /code

RUN npm install
