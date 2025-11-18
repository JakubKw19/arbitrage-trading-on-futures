# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* turbo.json ./
RUN pnpm install --frozen-lockfile

# Stage 2: Prune the monorepo to only needed packages
FROM base AS pruner
COPY . .
RUN pnpm turbo prune --scope=web --scope=backend --docker

# Stage 3: Install deps for pruned output
FROM node:20-alpine AS installer
WORKDIR /app
RUN npm install -g pnpm
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .

# Stage 4: Build everything
RUN pnpm turbo run build --filter=web... --filter=backend...

# Stage 5: Backend app
FROM node:20-alpine AS backend
WORKDIR /app

# Install PostgreSQL client for pg_isready
RUN apk add --no-cache postgresql-client

RUN npm install -g pnpm
# Copy built backend and dependencies
COPY --from=installer /app/apps/backend ./apps/backend
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

WORKDIR /app/apps/backend
RUN npx @better-auth/cli generate \
  --output prisma/schema.prisma \
  --config ../../packages/auth/src/config.ts
RUN npx prisma generate
EXPOSE 5000
# CMD ["node", "dist/apps/backend/src/main.js"]
CMD ["../../start.sh"]

# Stage 6: Web app
FROM node:20-alpine AS web
WORKDIR /app
RUN npm install -g pnpm

# Copy the pruned lockfile, workspace config, and package.json files
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/json/ .

# Install ONLY production dependencies
# This creates a slim node_modules with no devDependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the built application code (including the .next folder)
# and any shared packages from the builder stage
COPY --from=installer /app/apps/web ./apps/web
COPY --from=installer /app/packages ./packages

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
