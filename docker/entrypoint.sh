#!/bin/sh
set -e

apt-get update -y && apt-get install -y openssl

corepack enable
yarn
yarn prisma generate

exec yarn dev