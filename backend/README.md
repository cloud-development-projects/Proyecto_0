# Backend

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
