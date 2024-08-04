FROM node:lts-alpine

WORKDIR /app

RUN apt update && \
    apt upgrade -y

RUN docker run -it -e NGROK_AUTHTOKEN=2jxeTIO7oSS9orrNVH4Nymwpyho_58STrGZ5XYYusfuSvajye ngrok/ngrok http 3000

COPY . /app

CMD [ "npm", "run", "start" ]