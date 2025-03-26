FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g serve
EXPOSE 5500
CMD ["serve", "-s", ".", "-l", "5500"]
