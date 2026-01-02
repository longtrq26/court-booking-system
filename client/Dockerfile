# Giai đoạn Dependencies
FROM node:22-alpine AS deps

# libc6-compat cần thiết cho Next.js (SWC) khi chạy trên Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy file manifest để cài đặt và cache dependencies
COPY package.json package-lock.json ./
RUN npm ci


# Giai đoạn Build
FROM node:22-alpine AS builder
WORKDIR /app

# Sử dụng lại node_modules từ giai đoạn deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry của Next.js để tăng tốc độ build
ENV NEXT_TELEMETRY_DISABLED=1

# Nếu cần sử dụng biến client-side (NEXT_PUBLIC_*),
# hãy khai báo ARG và ENV ở đây để "bake" vào bản build.
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build


# Giai đoạn Chạy (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo nhóm và người dùng non-root để tăng cường bảo mật
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy các tệp tĩnh (public assets)
COPY --from=builder /app/public ./public

# Cấu hình "standalone" giúp tối ưu hóa kích thước ảnh bằng cách chỉ copy những file thực sự cần thiết
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Lệnh khởi chạy server Next.js ở chế độ standalone
CMD ["node", "server.js"]
