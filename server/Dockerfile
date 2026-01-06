# Giai đoạn Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Cài đặt các công cụ build cơ bản
RUN apk add --no-cache python3 make g++

# Copy root manifest files để tận dụng Docker cache
COPY package.json package-lock.json ./
# Copy server package.json để npm có thể nhận diện workspace
COPY server/package.json ./server/

# Cài đặt dependencies cho workspace server
RUN npm ci -w server

# Copy mã nguồn server
COPY server ./server

# Biên dịch TypeScript sang JavaScript
WORKDIR /usr/src/app/server
RUN npm run build


# Giai đoạn Chạy (Production)
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Thiết lập môi trường production
ENV NODE_ENV=production

# Copy root manifest files
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Chỉ cài đặt dependencies cho runtime của workspace server
RUN npm ci -w server --omit=dev && npm cache clean --force

# Copy thư mục build và các file cần thiết
COPY --from=builder /usr/src/app/server/dist ./server/dist

# Chạy ứng dụng với user non-root
USER node

# Port server lắng nghe
EXPOSE 3001

# Lệnh khởi chạy ứng dụng (build ra server/dist/src/main.js)
WORKDIR /usr/src/app/server
CMD ["node", "dist/src/main.js"]
