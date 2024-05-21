FROM node:20-alpine as base
WORKDIR ./app
EXPOSE 3000

FROM base as install
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install

FROM install as builder
COPY . .
RUN yarn build

CMD ["node", "dist/main.js" ]