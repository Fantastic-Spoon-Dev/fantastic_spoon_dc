#!/bin/sh
set -e

apt-get update -y && apt-get install -y openssl

# 生成 Prisma Client
echo "Generating Prisma Client..."
bun
bun add prisma
bun add @prisma/client
bunx prisma generate

exec bun dev