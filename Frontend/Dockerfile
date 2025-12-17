# Frontend React app Dockerfile (development-friendly)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Development server
EXPOSE 3000
CMD ["npm", "start"]
