FROM node:20-alpine as build

RUN apk add --update --virtual --no-cache python3 make g++

WORKDIR /app

COPY package.json .

COPY  ./yarn.lock .

RUN yarn

COPY . .

RUN yarn build

FROM node:20-alpine

RUN apk add --update --virtual --no-cache python3 make g++

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
