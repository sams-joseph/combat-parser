FROM node:6-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENV NPM_CONFIG_LOGLEVEL warn

RUN apk update && apk add bash && apk add curl && apk add git

RUN mkdir -p /usr/src

WORKDIR /usr/src

COPY . .

ENV PATH /usr/src/node_modules/.bin:$PATH

CMD ["bash"]
