<center><h1>🚀 NestJS multi-tenancy blog engine 🚀</h1></center>

## Description
A blog engine created for the [Applifting](https://applifting.cz/) Full Stack Challenge. Explore [the assignment here](https://github.com/Applifting/fullstack-exercise).

## Application overview

### Microservices
| Service Name   | Port | Description                                                  |
| -------------- | ---- | ------------------------------------------------------------ |
| `auth`         | 3004 | Authentication API                                           |
| `users`        | 3003 | Manages users CRUD                                           |
| `tenant`       | 3100 | Manages tenant CRUD                                          |
| `blog`         | 3001 | Manages articles and comments CRUD                           |
| `file-manager` | 2999 | Host for images (example only; real-world apps might use AWS S3 or something like that) |
| `gateway`      | 8080 | API Gateway     

### Technologies used
 - NestJS (as main framework) + Typescript
 - Sequelize-typescript (ORM) + PostgreSQL (for data storage with relations)
 - GraphQL & GraphQL Subscriptions (for live comments)
 - OAuth2.0 (for authentication)
 - Redis (for microservices communication and cache)
 - Axios (for health module)
 - Multer (for file-manager)
 - Jest (for unit testing)
## Multi-tenancy: Tenant-per-Schema

My app uses a **Tenant-per-Schema** model:

- **Data Isolation**: Each tenant gets its own database schema.
- **Performance**: Queries are faster with smaller, isolated datasets.
- **Customizability**: Easier schema adjustments for individual tenants.
- **Granular Maintenance**: Backups and updates on a per-tenant basis.

For each request, exclude tenant authentication, you should use ``X-API-KEY`` in headers to give API know, which tenant you use.


## Swagger
Swagger API documenation are on ``http://{HOST}:{SERVICE_PORT}/api``
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

Default tenant ID is <b>8e70bd91-628b-4459-ae38-954e88efc974</b>, so it can be used as X-API-KEY, or you can create new one.


## Roadmap
- [x] design the API
- [x] ideally, create both REST and GraphQL
- [x] document the API - REST in Swagger, GraphQL with documentation comments
- [x] write Swagger yourself or generate it, you can expose it as an endpoint
- [x] for GraphQL, expose GraphiQL or GraphQL Playground
- [x] dockerize your app
- [x] create a docker-compose file that can be used to run your app with all dependencies
- [x] implement login
- [x] seed the database
- [x] create simple CRUD for blog posts (articles)
  - [x] each article should have title, perex and content
  - [x] each article should also have a unique generated id
  - [x] each article should also have a timestamp
- [x] add the possibility to add comments to articles
- [x] a comment should have an author (just a string) and content
- [x] each comment should also have a timestamp
- [x] nested comments are for bonus points
- [x] add the possibility to vote on comments (Reddit-style + and -)
- [x] add the option to make commenting and voting realtime
- [x] Unit tests for article module
- [ ] Optionally also include some integration and e2e tests


## Stay in touch

- Author - [Roman Filatov](https://github.com/rvfch)

