FROM node:22

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build application
RUN yarn build

# Command to run the application (default to stdio transport)
ENTRYPOINT ["node", "--es-module-specifier-resolution=node", "dist/index.js"]
