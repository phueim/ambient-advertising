-- Initialize the database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (this runs after DB is created)
-- Just ensure we have the right permissions
GRANT ALL PRIVILEGES ON DATABASE ambient_advertising TO postgres;