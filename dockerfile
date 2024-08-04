FROM node:lts-alpine

WORKDIR /app

EXPOSE 3000

COPY . /app

RUN npm install

CMD [ "npm", "run", "start" ]