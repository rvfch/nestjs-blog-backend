<center><h1>🚀 NestJS multi-tenancy blog engine 🚀</h1></center>

## Description
A blog engine created for the [Applifting](https://applifting.cz/) Full Stack Challenge. Explore [the assignment here](https://github.com/Applifting/fullstack-exercise).

## Application overview

### Microservices
`auth` 

`users`


`tenant`

`blog`

`file-manager`

`gateway`

## Installation prerequisites

- Node.js v18.16.0
- NPM
- Docker latest

## Installation (DEVELOPMENT)

```bash
# run docker-compose up 
$ docker-compose up -d -V --build
# run migrations
$ npm run migrate-db
# run seeds
$ npm run seed-db
```

- Default tenant ID is <b>8e70bd91-628b-4459-ae38-954e88efc974</b>, so it can be used as X-API-KEY, or you can create new one.


## Stay in touch

- Author - [Roman Filatov](https://github.com/rvfch)

