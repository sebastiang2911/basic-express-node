# REST Server

User-management REST API built with Node.js, Express, TypeScript, MongoDB, and Mongoose.

Features:

- User creation and updates
- Partial user updates with `PATCH`
- bcrypt password hashing
- MongoDB-backed role validation
- Email format and uniqueness validation
- Pagination
- Soft deletion
- Sanitized responses without passwords
- Responsive API landing page and custom 404 page

## Requirements

- Node.js 20+
- Yarn
- MongoDB database

## Setup

Install dependencies:

```bash
yarn install
```

Create `.env` from the included example:

```env
PORT=8080
MONGODB_CNN=mongodb://127.0.0.1:27017/restserver
```

Start the development server:

```bash
yarn dev
```

Open <http://localhost:8080/>.

## API

Base URL: `http://localhost:8080/api/users`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/users?from=0&limit=5` | List active users |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/:id` | Update an existing user |
| `PATCH` | `/api/users/:id` | Partially update an existing user |
| `DELETE` | `/api/users/:id` | Soft-delete a user |

The `PUT`, `PATCH`, and `DELETE` routes require a valid MongoDB ObjectId belonging to an existing user.

### List users

```bash
curl 'http://localhost:8080/api/users?from=0&limit=5'
```

Only users with `state: true` are returned.

The controller runs the total count and user query concurrently with `Promise.all`:

```ts
const [total, users] = await Promise.all([
  User.countDocuments({ state: true }),
  User.find({ state: true }).skip(Number(from)).limit(Number(limit)),
]);
```

This matters because neither database operation depends on the other. Running them in parallel reduces total response time compared with awaiting them sequentially. `Promise.all` also rejects immediately if either operation fails, allowing the request error to be handled consistently. Use it only for independent asynchronous operations.

### Create a user

```bash
curl -X POST http://localhost:8080/api/users \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Sebastian",
    "email": "sebastian@example.com",
    "password": "Test1234",
    "role": "ADMIN_ROLE"
  }'
```

Validation rules:

- `name` is required.
- `email` must be valid and unique.
- `password` requires at least six characters.
- `role` must exist in the roles collection.

Passwords are hashed before storage and excluded from JSON responses.

### Update a user

```bash
curl -X PUT http://localhost:8080/api/users/USER_OBJECT_ID \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Sebastian Updated",
    "password": "NewPassword123",
    "role": "USER_ROLE"
  }'
```

If supplied, the new password is hashed before the update. The API does not permit changing `email` or `google` through this endpoint.

### Partially update a user

Send only the properties that need to change:

```bash
curl -X PATCH http://localhost:8080/api/users/USER_OBJECT_ID \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Sebastian Updated"
  }'
```

`role` is optional, but must exist in the roles collection when supplied. A supplied password is hashed. The API ignores `_id`, `email`, and `google` from the request body.

### Delete a user

```bash
curl -X DELETE http://localhost:8080/api/users/USER_OBJECT_ID
```

Deletion is logical: the user remains in MongoDB with `state: false`.

## Validation errors

Invalid requests return HTTP `400`:

```json
{
  "errors": [
    {
      "type": "field",
      "value": "123",
      "msg": "Its not valid ID",
      "path": "id",
      "location": "params"
    }
  ]
}
```

## Project structure

```text
controllers/        Request handlers
database/           MongoDB connection
helpers/            Database validators
middlewares/        Express validation middleware
models/             Mongoose models and server setup
public/             Landing page and 404 page
routes/             API route definitions
index.ts            Application entry point
```

## Request flow

```text
Request
  → Express middleware
  → route validators
  → validation middleware
  → controller
  → Mongoose
  → JSON response
```

Unknown routes return HTTP `404` and render `public/404.html`.
