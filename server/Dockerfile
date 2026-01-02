# Giai đoạn Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Cài đặt các công cụ build cơ bản cho các package cần biên dịch (như bcrypt, sharp)
RUN apk add --no-cache python3 make g++

# Copy file manifest trước để tối ưu Docker cache lớp node_modules
COPY package.json package-lock.json ./
RUN npm ci

# Copy toàn bộ mã nguồn
COPY . .

# Biên dịch TypeScript sang JavaScript
RUN npm run build


# Giai đoạn Chạy (Production)
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Thiết lập môi trường production để tối ưu hóa runtime
ENV NODE_ENV=production

# Copy file manifest để cài đặt dependencies cho runtime
COPY package.json package-lock.json ./

# Chỉ cài đặt các dependencies cần thiết cho bản build, xóa cache để giảm kích thước ảnh
RUN npm ci --omit=dev && npm cache clean --force

# Copy thư mục build từ giai đoạn builder
COPY --from=builder /usr/src/app/dist ./dist

# Chạy ứng dụng với user non-root để đảm bảo bảo mật
USER node

# Port mà server sẽ lắng nghe
EXPOSE 3001

# Lệnh khởi chạy ứng dụng
CMD ["node", "dist/main.js"]
