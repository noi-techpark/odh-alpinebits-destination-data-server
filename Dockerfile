# Base Dokcer image for Node.js
FROM node:10

# Working directory
WORKDIR /src/destination-data-server

# Copies package.json and package-lock.json and runs npm install
COPY package*.json ./
RUN npm install

# Bundles app source
COPY . .

# Exposes the services on the specified port
EXPOSE "${REF_SERVER_PORT}"

# Initiates the server
CMD [ "npm", "run", "server" ]
