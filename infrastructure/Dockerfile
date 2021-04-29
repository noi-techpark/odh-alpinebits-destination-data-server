FROM node:14

WORKDIR /code

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "run", "server" ]
