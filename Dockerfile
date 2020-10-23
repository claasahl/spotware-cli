FROM debian:10

SHELL [ "/bin/bash", "-l", "-c" ]

RUN apt-get update \
    && apt-get install -y gdb lldb curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
RUN nvm install 12
RUN nvm use 12

# Build Integration / Middleware
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -if-present
RUN npm run test
# RUN npm ci --only=production

CMD npm start