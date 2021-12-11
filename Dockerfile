FROM node:16.3.0-alpine as build

WORKDIR /app

COPY package.json .

COPY  ./yarn.lock .

RUN yarn

COPY . .

RUN yarn build

FROM node:16.3.0-alpine

RUN apk add --update --virtual --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

ENV PORT=8080

EXPOSE 8080

WORKDIR /app

# COPY  .npmrc .

COPY  ./package.json .

COPY  ./yarn.lock .

RUN   yarn --production && yarn cache clean --force

COPY  --from=build /app/lib ./lib

COPY  --from=build /app/static ./static

COPY  --from=build /app/view ./view

CMD yarn prod