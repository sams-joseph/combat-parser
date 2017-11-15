FROM node:6-alpine

ENV NPM_CONFIG_LOGLEVEL warn

RUN apk update && apk add bash && apk add curl && apk add git

RUN mkdir -p /usr/src

WORKDIR /usr/src

RUN npm install -g babel-cli

COPY package.json package.json

RUN npm install && npm cache clean

COPY . .

RUN npm run build

CMD ["node", "bin/production"]