FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are
# copied
COPY package*.json ./
COPY src/prisma ./prisma

# Install app dependencies
RUN npm install --force

COPY . .

RUN npm run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# 👇 copy prisma directory
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["npm", "run", "start:migrate:prod"]
