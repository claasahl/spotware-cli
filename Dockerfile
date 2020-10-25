FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

# Build Integration / Middleware
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -if-present
RUN npm run test
# RUN npm ci --only=production

CMD npm run inspect