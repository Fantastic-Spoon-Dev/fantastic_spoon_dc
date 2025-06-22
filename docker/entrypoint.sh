#!/bin/sh
set -e

# apt-get update -y && apt-get install -y openssl

# sleep 3

# echo "Generating Prisma Client..."
# bun add prisma
# bun add @prisma/client
# bunx prisma generate

exec bun dev