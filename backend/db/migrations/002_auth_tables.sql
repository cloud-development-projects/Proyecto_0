-- *****************************
-- * AUTH MODULE TABLES        *
-- *****************************

-- Users table for authentication (separate from the main 'usuario' table)
-- This table is specifically for the JWT auth system
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add comments for clarity
COMMENT ON TABLE users IS 'Authentication users table for JWT auth system';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.username IS 'Unique username for authentication';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hash of the user password';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the user was created';

-- Note: This 'users' table is separate from the 'usuario' table defined in the main schema.
-- The 'usuario' table appears to be for the main application logic, while this 'users' table
-- is specifically for authentication purposes. In a future iteration, you might want to:
-- 1. Merge these tables if they represent the same entity
-- 2. Add a foreign key relationship between them
-- 3. Use the existing 'usuario' table for authentication by modifying the auth code
