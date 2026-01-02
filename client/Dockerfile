# Giai đoạn Dependencies
FROM node:22-alpine AS deps

# libc6-compat cần cho Next.js (SWC) trên Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Copy root manifest files
COPY package.json package-lock.json ./
# Copy client package.json cho workspace
COPY client/package.json ./client/

# Cài đặt dependencies cho workspace client
RUN npm ci -w client


# Giai đoạn Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy root manifests và node_modules từ deps
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/client/node_modules ./client/node_modules

# Copy mã nguồn client
COPY client ./client

# Tắt telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build client
WORKDIR /usr/src/app/client
RUN npm run build


# Giai đoạn Chạy (Runner)
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bảo mật với user non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy static assets
COPY --from=builder /usr/src/app/client/public ./client/public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/client/.next/static ./client/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Khởi chạy Next.js standalone
# Lưu ý: standalone server chạy từ thư mục gốc của nó
WORKDIR /usr/src/app/client
CMD ["node", "server.js"]
