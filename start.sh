#!/bin/sh
set -e

# Wait for Postgres to be ready
until pg_isready -h db -p 5432 -U postgres; do
  echo "Waiting for Postgres..."
  sleep 2
done

# Run Prisma migrations
echo "Running migrations..."
if [ "$(npx prisma migrate status --schema=prisma/schema.prisma --print)" = "No migrations found" ]; then
  echo "No migrations found — running initial dev migration..."
  npx prisma migrate dev --name init --schema=prisma/schema.prisma
else
  echo "Migrations found — deploying..."
  npx prisma migrate deploy --schema=prisma/schema.prisma
fi

# Start NestJS app
echo "Starting backend..."
node dist/apps/backend/src/main.js
# pnpm exec nest start --watch
