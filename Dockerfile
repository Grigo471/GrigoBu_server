FROM node:21-alpine

WORKDIR /usr/local/app

COPY package*.json .

RUN npm install

COPY . .

COPY secrets ./secrets

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/main"]
