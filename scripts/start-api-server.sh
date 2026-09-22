#!/bin/bash
# Start the Grownox API server
set -e

echo "[start] Starting Grownox API server..."
cd "$(dirname "$0")/.."
PORT=${PORT:-8080} npm run dev --workspace=artifacts/api-server

