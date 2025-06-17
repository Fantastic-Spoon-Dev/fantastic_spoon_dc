#!/bin/sh
set -e

# 安装 wget
echo "Installing wget..."
apt-get update && apt-get install -y wget

# 等待 Chrome 服务就绪
echo "Waiting for Chrome to be ready..."
while ! wget -q --spider http://chrome:3000/json/version; do
  echo "Chrome is unavailable - sleeping"
  sleep 1
done
echo "Chrome is up and ready!"

# 生成 Prisma Client
echo "Generating Prisma Client..."
bun
bun add prisma
bun add @prisma/client
bunx prisma generate

exec bun dev