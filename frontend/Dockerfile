FROM node:alpine AS builder

RUN apk add --no-cache gcompat

WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
