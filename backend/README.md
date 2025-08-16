# Backend

## Environment Variables

The application uses environment variables for configuration. Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

### Available Environment Variables

| Variable         | Default         | Description                                    |
| ---------------- | --------------- | ---------------------------------------------- |
| `PORT`           | `8080`          | Server port                                    |
| `HOST`           | `0.0.0.0`       | Server host                                    |
| `GIN_MODE`       | `debug`         | Gin mode (debug, release, test)                |
| `JWT_SECRET`     | `dev-secret...` | JWT signing secret (change in production!)     |
| `JWT_ISSUER`     | `Proyecto_0`    | JWT issuer                                     |
| `JWT_EXPIRATION` | `24h`           | JWT token expiration (e.g., 1h, 30m, 24h)      |
| `APP_NAME`       | `Proyecto_0`    | Application name                               |
| `APP_VERSION`    | `1.0.0`         | Application version                            |
| `APP_ENV`        | `development`   | Environment (development, staging, production) |

### Ways to Set Environment Variables

1. **Using .env file** (recommended for development):

   ```bash
   # Copy the example file
   cp env.example .env
   # Edit .env with your values
   vim .env
   ```

2. **Export in shell**:

   ```bash
   export JWT_SECRET="my-super-secret-key"
   export PORT=3000
   go run cmd/api/main.go
   ```

3. **Inline with command**:

   ```bash
   JWT_SECRET="my-key" PORT=3000 go run cmd/api/main.go
   ```

4. **Using docker-compose**:

   ```yaml
   # docker-compose.yml
   services:
     api:
       build: .
       environment:
         - JWT_SECRET=my-secret
         - PORT=8080
         - GIN_MODE=release
   ```

5. **Using systemd (production)**:
   ```ini
   # /etc/systemd/system/proyecto0.service
   [Service]
   Environment=JWT_SECRET=prod-secret
   Environment=GIN_MODE=release
   Environment=APP_ENV=production
   ```

## Auth module (in-memory)

Endpoints (under `/api`):

- `POST /api/auth/register`: `{ "username": "alice", "password": "secret" }`
- `POST /api/auth/login`: `{ "username": "alice", "password": "secret" }` → `{ "token": "<JWT>" }`
- `POST /api/auth/logout`: Requires `Authorization: Bearer <JWT>` header
- `GET /api/protected/me`: Requires `Authorization: Bearer <JWT>` header

Notes:

- Passwords are hashed using bcrypt in `internal/auth/password.go`.
- JWTs are created and verified via `internal/auth/jwt.go`.
- In-memory storage simulates persistence inside `internal/users/repository.go`.
- Swapping to Postgres would be done by creating a new repo implementing `users.Repository`.

### Example curl flow

Register:

```bash
curl -sS -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}'
```

Login:

```bash
TOKEN=$(curl -sS -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}' | jq -r .token)
echo $TOKEN
```

Protected endpoint:

```bash
curl -sS http://localhost:8080/api/protected/me \
  -H "Authorization: Bearer $TOKEN"
```

Logout:

```bash
curl -sS -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```
