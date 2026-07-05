# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
# openssl is required by Prisma's engines on Alpine (OpenSSL 3); the build/g++
# toolchain is for native npm deps.
RUN apk add --no-cache python3 make g++ openssl
COPY package.json package-lock.json* ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/backend apps/backend
RUN npm run db:generate -w @edubridge/backend
RUN npm run build -w @edubridge/backend

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma's query + schema engines need libssl at runtime (migrate deploy on boot).
RUN apk add --no-cache openssl
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
