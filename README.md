# REST Server

An educational REST API built with Node.js, Express, and TypeScript. It includes a home page, user API, separate controllers, and a global 404 page.

## Requirements and setup

- Node.js 20+
- Yarn

```bash
yarn install
yarn dev
```

The server reads `PORT` from `.env`; it defaults to `8080` when not defined.

```env
PORT=8080
```

Open <http://localhost:8080/>.

## Application flow

```text
index.ts
  └─ creates Server and runs listen()
      ├─ middlewares()
      │   ├─ CORS
      │   ├─ JSON body parsing
      │   └─ static files from public/
      └─ routes()
          ├─ /api/users → routes/users.ts → controllers/users.ts
          └─ unknown route → public/404.html
```

Express evaluates middleware and routes in registration order. The 404 handler is last, so it only responds when no previous route matches.

## Project structure

```text
controllers/users.ts  # HTTP response handlers
models/server.ts      # Express, middleware, routes, and port
public/index.html     # Home page served at /
public/404.html       # Unknown-route page
routes/users.ts       # API methods and paths
index.ts              # Application entry point
```

## User API

Base URL: `http://localhost:8080/api/users`

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/users` | Gets users |
| `POST` | `/api/users` | Reads `name` and `age` from JSON |
| `PUT` | `/api/users/:id` | Reads the ID from the path |
| `PUT` | `/api/users?id=10` | Also accepts the ID as a query parameter |
| `PATCH` | `/api/users` | Example partial update |
| `DELETE` | `/api/users` | Example deletion |

## Examples

```bash
curl http://localhost:8080/api/users

curl -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","age":25}'

curl -X PUT http://localhost:8080/api/users/10
curl -X PUT 'http://localhost:8080/api/users?id=10&page=1&limit=20'
curl -X PATCH http://localhost:8080/api/users
curl -X DELETE http://localhost:8080/api/users
```

## Responses

- `/`: serves `public/index.html` through `express.static()`.
- `/api/users`: returns JSON from the controllers.
- An unregistered path, such as `/not-found`: returns HTTP `404` and serves `public/404.html`.

## Adding routes

1. Create the controller in `controllers/`.
2. Associate it with an HTTP method in `routes/`.
3. For a new router, mount it in `models/server.ts` before the 404 handler.
