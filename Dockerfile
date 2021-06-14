#Building Scraper
FROM alpine:latest AS tiktok_scraper.build

WORKDIR /usr/app

RUN apk update && apk add --update nodejs nodejs-npm python3 pkgconfig pixman-dev 
RUN apk add --update cairo-dev pango-dev make g++

COPY package*.json tsconfig.json .prettierrc.js bin ./
COPY ./src ./src

RUN npm i
RUN npm run docker:build
RUN rm -rf src node_modules


#Using Scraper
FROM alpine:latest AS tiktok_scraper.use

WORKDIR /usr/app

RUN apk update && apk add --update nodejs nodejs-npm python3 pkgconfig pixman-dev
RUN apk add --update cairo-dev pango-dev make g++

COPY --from=tiktok_scraper.build ./usr/app ./
COPY ./bin ./bin
COPY package* ./

ENV SCRAPING_FROM_DOCKER=1

RUN mkdir -p files
RUN npm i --production

ENTRYPOINT [ "node",  "bin/cli.js" ]
