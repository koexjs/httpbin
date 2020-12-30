FROM node:14.15.3-alpine as build

WORKDIR /app

COPY package.json .

COPY  ./yarn.lock .

RUN yarn

COPY . .

RUN yarn build

FROM node:14.15.3-alpine

ENV PORT=8080

EXPOSE 8080

WORKDIR /app

# COPY  .npmrc .

COPY  ./package.json .

COPY  ./yarn.lock .

RUN   yarn --production && yarn cache clean --force

COPY  --from=build /app/dist ./dist

COPY  --from=build /app/static ./static

COPY  --from=build /app/view ./view

CMD yarn prod