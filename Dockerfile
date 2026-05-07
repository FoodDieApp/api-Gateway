# -------- BUILD STAGE --------
FROM node:18-alpine AS builder

WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy source
COPY tsconfig.json ./
COPY src ./src

# build typescript
RUN npm run build


# -------- RUNTIME STAGE --------
FROM node:18-alpine

WORKDIR /app

# copy only required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]