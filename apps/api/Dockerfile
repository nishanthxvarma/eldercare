FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
RUN npm ci
COPY apps/api ./apps/api
RUN npm run build --workspace=api

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
RUN npm ci --only=production
COPY --from=builder /app/apps/api/dist ./apps/api/dist
EXPOSE 5000
CMD ["npm", "start", "--workspace=api"]
