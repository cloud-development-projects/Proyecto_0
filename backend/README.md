# Backend

A RESTful API built with Go (Gin) and PostgreSQL for task management with user authentication.

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
| `DB_DRIVER`         | `postgres`      | Database driver (only postgres supported)      |
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

This application requires PostgreSQL as the database backend.

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

The project includes Docker Compose configuration for the full stack:

```bash
# Start complete environment (PostgreSQL + API + Frontend)
make local
# or
docker-compose -f docker-compose.local.yml up -d
```

**Available Make Commands**:

```bash
make help    # Show all available commands
make local   # Start full local environment (PostgreSQL + API + Frontend)
make build   # Build the Go application
make logs    # Show logs from all containers
make clean   # Clean up all containers, volumes, and images
```

**Included Services**:

- **PostgreSQL 15**: Database with auto-initialization (`:5432`)
- **Go API**: The backend application with CORS enabled (`:8080`)
- **React Frontend**: The web interface (`:3000`)

**Database Initialization**:
The PostgreSQL container automatically runs:

1. `db/000_create_tables.sql` - Main project schema (users, categories, states, tasks)
2. `db/001_data_dummy.sql` - Dummy/test data for development

**Service URLs**:

- Frontend: http://localhost:3000
- API: http://localhost:8080
- PostgreSQL: localhost:5432

## API Endpoints

### Authentication Endpoints (Public)

Base URL: `http://localhost:8080/api`

- `POST /api/auth/register`: Register a new user

  - Body: `{ "username": "alice", "password": "secret" }`
  - Response: `{ "id": 1, "username": "alice", "profile_img": "..." }`

- `POST /api/auth/login`: Authenticate user and get JWT token

  - Body: `{ "username": "alice", "password": "secret" }`
  - Response: `{ "token": "<JWT>", "id": 1, "username": "alice", "profile_img": "..." }`

- `POST /api/auth/logout`: Invalidate JWT token
  - Headers: `Authorization: Bearer <JWT>`
  - Response: `{ "message": "Logged out successfully" }`
  - **Note**: Adds the token to an in-memory revocation list, making it unusable for future requests

### Protected Endpoints (Require Authentication)

All protected endpoints require: `Authorization: Bearer <JWT>`

#### User Profile

- `GET /api/protected/me`: Get current user info
  - Response: `{ "claims": {...}, "app": "Proyecto_0" }`

#### Categories Management

- `POST /api/protected/categories`: Create category
  - Body: `{ "name": "Work", "description": "Work related tasks" }`
- `GET /api/protected/categories`: Get all categories
- `GET /api/protected/categories/:id`: Get category by ID
- `PUT /api/protected/categories/:id`: Update category
- `DELETE /api/protected/categories/:id`: Delete category

#### Tasks Management

- `POST /api/protected/tasks`: Create new task
  - Body: `{ "task_text": "Complete project", "end_date": "2024-01-20", "category_id": 1 }`
- `GET /api/protected/tasks`: Get all user's tasks (supports filtering)
  - Query params: `?category_id=1&state_id=2`
- `GET /api/protected/tasks/:id`: Get task details by ID
- `PUT /api/protected/tasks/:id`: Update task
  - Body: `{ "task_text": "Updated text", "end_date": "2024-01-25", "state_id": 2 }`
- `DELETE /api/protected/tasks/:id`: Delete task

### Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with salt
- **JWT Authentication**: Secure token-based authentication with server-side invalidation
  - Tokens include standard claims (iss, sub, iat, exp) and custom user data
  - **Token Revocation**: Logout adds tokens to an in-memory blacklist, preventing reuse
  - Middleware checks both token validity and revocation status
- **CORS**: Configured to allow frontend requests from localhost:3000
- **Input Validation**: Request payload validation with proper error responses
- **Ownership Checks**: Users can only access their own tasks and data

## Example API Usage

### Authentication Flow

**Register a new user:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}'
```

**Login and get JWT token:**

```bash
TOKEN=$(curl -sS -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}' | jq -r .token)
echo $TOKEN
```

### Working with Tasks

**Create a category:**

```bash
curl -X POST http://localhost:8080/api/protected/categories \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Work","description":"Work related tasks"}'
```

**Create a task:**

```bash
curl -X POST http://localhost:8080/api/protected/tasks \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"task_text":"Complete project documentation","end_date":"2024-01-20","category_id":1}'
```

**Get all tasks:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/protected/tasks
```

**Get specific task details:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/protected/tasks/1
```

**Update task:**

```bash
curl -X PUT http://localhost:8080/api/protected/tasks/1 \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"task_text":"Updated task text","state_id":2}'
```

**Logout:**

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Task States

The system includes predefined task states (in Spanish):

- **1**: Sin Empezar (Not Started)
- **2**: En Progreso (In Progress)
- **3**: Completada (Completed)

## Development Data

The dummy data includes:

- **5 test users** with real bcrypt password hashes (all use password: `Prueba123`)
- **5 test categories** in Spanish: Trabajo, Estudio, Personal, Deporte, Compras
- **10 test tasks** with various states and due dates

**Test Users:**

- `juanperez`, `maria_garcia`, `carlos23`, `ana_rodriguez`, `luis_m`
- All users share the same password: `Prueba123` for development
