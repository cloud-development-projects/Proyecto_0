# Backend

## Environment Variables

The application uses environment variables for configuration. Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

### Available Environment Variables

| Variable            | Default         | Description                                    |
| ------------------- | --------------- | ---------------------------------------------- |
| `PORT`              | `8080`          | Server port                                    |
| `HOST`              | `0.0.0.0`       | Server host                                    |
| `GIN_MODE`          | `debug`         | Gin mode (debug, release, test)                |
| `JWT_SECRET`        | `dev-secret...` | JWT signing secret (change in production!)     |
| `JWT_ISSUER`        | `Proyecto_0`    | JWT issuer                                     |
| `JWT_EXPIRATION`    | `24h`           | JWT token expiration (e.g., 1h, 30m, 24h)      |
| `APP_NAME`          | `Proyecto_0`    | Application name                               |
| `APP_VERSION`       | `1.0.0`         | Application version                            |
| `APP_ENV`           | `development`   | Environment (development, staging, production) |
| `DB_DRIVER`         | `memory`        | Database driver (memory, postgres)             |
| `DB_HOST`           | `localhost`     | PostgreSQL host                                |
| `DB_PORT`           | `5432`          | PostgreSQL port                                |
| `DB_NAME`           | `proyecto_0`    | PostgreSQL database name                       |
| `DB_USER`           | `postgres`      | PostgreSQL username                            |
| `DB_PASSWORD`       | `password`      | PostgreSQL password                            |
| `DB_SSL_MODE`       | `disable`       | PostgreSQL SSL mode (disable, require, etc.)   |
| `DB_MAX_OPEN_CONNS` | `25`            | Maximum open database connections              |
| `DB_MAX_IDLE_CONNS` | `5`             | Maximum idle database connections              |

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

## PostgreSQL Database Setup

This application supports both in-memory storage (for development) and PostgreSQL (for production).

### Option 1: In-Memory Database (Default)

By default, the app uses in-memory storage. No setup required:

```bash
# Uses in-memory database
go run cmd/api/main.go
```

### Option 2: PostgreSQL Database

#### Using Docker (Recommended)

1. **Start PostgreSQL with Docker**:

   ```bash
   # Start PostgreSQL container
   docker run --name postgres-proyecto0 \
     -e POSTGRES_DB=proyecto_0 \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Configure environment variables**:

   ```bash
   # In your .env file or export these
   export DB_DRIVER=postgres
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=proyecto_0
   export DB_USER=postgres
   export DB_PASSWORD=password
   export DB_SSL_MODE=disable
   ```

3. **Run the application**:
   ```bash
   go run cmd/api/main.go
   ```
   The app will automatically create the necessary tables on startup.

#### Using Local PostgreSQL Installation

1. **Install PostgreSQL** (macOS with Homebrew):

   ```bash
   brew install postgresql
   brew services start postgresql
   ```

2. **Create database and user**:

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE proyecto_0;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE proyecto_0 TO postgres;
   \q
   ```

3. **Configure and run** (same as Docker steps 2-3 above)

#### Using Docker Compose (Recommended)

The project includes Docker Compose configurations for easy setup:

**Development Setup** (PostgreSQL only, run Go app locally):

```bash
# Start PostgreSQL database
make dev
# or
docker-compose -f docker-compose.dev.yml up -d

# Run Go app locally
cd backend && DB_DRIVER=postgres DB_HOST=localhost go run cmd/api/main.go
```

**Production Setup** (PostgreSQL + Go app in containers):

```bash
# Start full environment
make prod
# or
docker-compose up -d
```

**Available Make Commands**:

```bash
make help          # Show all available commands
make dev           # Start PostgreSQL for development
make prod          # Start full production environment
make test-memory   # Run API with in-memory database
make test-postgres # Run API with PostgreSQL
make clean         # Clean up all containers and volumes
```

**Included Services**:

- **PostgreSQL 15**: Database with auto-initialization
- **Adminer**: Web-based database admin (dev mode only) at http://localhost:8081
- **Go API**: The backend application

**Database Initialization**:
The PostgreSQL container automatically runs:

1. `db/000_create_tables.sql` - Main project schema (usuario, categoria, estado, tarea)
2. `db/001_data_dummy.sql` - Dummy/test data for development
3. Module tables (users) are created automatically by the application

### Database Schema

The application automatically creates these tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_img TEXT NULL
);

CREATE INDEX idx_users_username ON users(username);
```

### Switching Between Databases

Simply change the `DB_DRIVER` environment variable:

- `DB_DRIVER=memory` → In-memory storage
- `DB_DRIVER=postgres` → PostgreSQL database

No code changes required!

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
