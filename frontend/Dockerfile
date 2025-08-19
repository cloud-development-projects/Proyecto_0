FROM node:alpine AS builder

RUN apk add --no-cache gcompat

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
