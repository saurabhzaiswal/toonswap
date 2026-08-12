#!/bin/bash

set -e

echo "================================"
echo "Starting ToonSwap infrastructure..."
echo "================================"

# ============================================
# PostgreSQL
# ============================================

echo "Checking PostgreSQL..."

if docker ps -a --format '{{.Names}}' | grep -q '^toonswap-postgres$'; then
    echo "PostgreSQL container already exists."
    docker start toonswap-postgres 2>/dev/null || true
else
    echo "Creating PostgreSQL container..."

    docker run \
        --name toonswap-postgres \
        -e POSTGRES_USER=toonswap \
        -e POSTGRES_PASSWORD=toonswap_dev \
        -e POSTGRES_DB=toonswap \
        -p 5432:5432 \
        -v toonswap-postgres-data:/var/lib/postgresql \
        -d postgres:18-alpine
fi

# ============================================
# Redis
# ============================================

echo "Checking Redis..."

if docker ps -a --format '{{.Names}}' | grep -q '^toonswap-redis$'; then
    echo "Redis container already exists."
    docker start toonswap-redis 2>/dev/null || true
else
    echo "Creating Redis container..."

    docker run \
        --name toonswap-redis \
        -p 6379:6379 \
        -v toonswap-redis-data:/data \
        -d redis:7-alpine \
        redis-server --appendonly yes
fi

# ============================================
# Wait for PostgreSQL
# ============================================

echo "================================"
echo "Waiting for PostgreSQL..."
echo "================================"

until docker exec toonswap-postgres \
    pg_isready -U toonswap -d toonswap >/dev/null 2>&1
do
    sleep 1
done

echo "PostgreSQL ready."

# ============================================
# Wait for Redis
# ============================================

echo "================================"
echo "Waiting for Redis..."
echo "================================"

until docker exec toonswap-redis \
    redis-cli ping 2>/dev/null | grep -q PONG
do
    sleep 1
done

echo "Redis ready."

# ============================================
# Prisma
# ============================================

echo "================================"
echo "Running Prisma migrations..."
echo "================================"

cd /workspaces/toonswap/backend

npx prisma migrate deploy

echo "================================"
echo "Infrastructure ready!"
echo "================================"
echo "PostgreSQL: localhost:5432"
echo "Redis:       localhost:6379"
echo "================================"