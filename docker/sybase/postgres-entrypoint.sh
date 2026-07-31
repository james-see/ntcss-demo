#!/bin/bash
# Custom entrypoint for Sybase-compatible Postgres
# Initializes the warehouse database with schema and seed data

echo "=== Initializing Warehouse Database (Sybase-compatible Postgres) ==="

# Wait for Postgres to be ready
until pg_isready -U warehouse_user -d warehouse 2>/dev/null; do
    echo "Waiting for Postgres..."
    sleep 2
done

echo "Postgres is ready. Loading schema..."

# Run the init SQL (adapted for Postgres with Sybase compatibility)
psql -U warehouse_user -d warehouse -f /docker-entrypoint-initdb.d/init-postgres.sql 2>&1 || true

echo "=== Warehouse Database initialized ==="

# Keep running
exec postgres