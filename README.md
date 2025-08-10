
# Grocery Store 

## Description

Grocery Store is a company that has stores in various locations in Serbia.

## Content

- [Grocery Store](#grocery-store)
  - [Description](#description)
  - [Content](#content)
  - [⚒️ Technologies](#️-technologies)
  - [📜 Swagger](#-swagger)
  - [🧑‍💻 Development](#-development)
    - [Prerequisites](#prerequisites)
    - [Getting started](#getting-started)
    - [Additional info](#additional-info)
  - [🏛 Architecture](#-architecture)
    - [Project Structure](#project-structure)
    - [MongoDB collections](#mongodb-collections)

## ⚒️ Technologies

- [Node.js](https://nodejs.org/en/): JavaScript runtime environment.
- [NestJS](https://nestjs.com/): Node.js framework.
- [TypeScript](https://www.typescriptlang.org/): programming language.
- [npm](https://www.npmjs.com/): package manager.
- [Jest](https://jestjs.io/): testing library.

## 📜 Swagger

- To visit the Swagger UI: [http:localhost:3000/api/docs](https://claiming.localsearch.ch/api/docs)


## 🧑‍💻 Development
### Prerequisites
- Node v22.14.0
- Git
- Docker
- MongoDB installed on local machine or docker, to run in docker container
  
### Getting started
1. Run command in terminal:
```code
git@github.com:vlajkod/grocery-store-insightful.git
cd grocery-store-insightful
```
2. Run docker container with the mongo db instance (optional, if there is installation on local machine)
```code
docker compose up -d
```
3. Copy .env.example to .env file manually, or with terminal
```code
cp .env.example .env
```
4. Install npm dependencies
```code
npm install
```
5. Run to populate mongo db with initial script
```code
npm run seed
```
6. Run application 
```code
npm run start
```
7. go to swagger docs: http://localhost:3000/api/docs

Enjoy 🎉

### Additional info

To use API, you have to login first. Initial script will add test user to the root of the location(node) Srbija

Credentials:
```
email: manager.serbia@example.rs
password: Pass123!
```
Swagger docs are already pre-populate with this credentials.


## 🏛 Architecture

The application is designed following the Clean Code architecture principles in NestJS with MongoDB.

The initial database seeding script is implemented to accept a JSON-like structure, allowing for easy extension and adaptation to new requirements. (Data can be imported via JSON, CSV, and other formats). 

An initial user with the MANAGER role is included to enable further system administration.

### Project Structure

```code 
grocery-store-insightful/
├── src/
│   ├── app.exception.ts
│   ├── app.module.ts
│   ├── config/
│   ├── db/
│   │   ├── location-tree.ts - JSON like structor of the location (Nodes)
│   │   └── seed.ts - initial script for the db
│   ├── decorators/
│   ├── initializers/
│   ├── main.ts
│   ├── modules/
│   │   ├── auth/ - handling authentication and authorization of app (login, generate JWT token)
│   │   ├── health/
│   │   ├── location/ - handling location (Nodes) related logic
│   │   ├── user/ - handling users related logic
├── test/
│   ├── unit/
```
### MongoDB collections
```code
 User collection
 {
  "_id": ObjectId,
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "MANAGER" | "EMPLOYEE",
  "locationId": ObjectId
}
```
Location collection
```code
{
  "_id": ObjectId,
  "name": "string",
  "type": "STORE" | "OFFICE"
  "parentId": ObjectId
  "path": Array<ObjectId>
}
```
A key aspect is the path field, which follows the materialized path pattern to avoid recursively querying the database from the parent node down to the child nodes. This approach provides direct access to all nodes, allowing the hierarchy to be easily determined.
The downside is that the field must be maintained during write operations. However, since the application is optimized for read performance — which is the primary goal — this is an acceptable compromise.
