#!/usr/bin/env bash
# builds both images from their own contexts

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TAG="${TAG:-dev}"

docker build \
  -f "$ROOT/docker/Dockerfile.gateway" \
  -t "agent-gateway:$TAG" \
  "$ROOT/apps/gateway"

docker build \
  -f "$ROOT/docker/Dockerfile.worker" \
  -t "agent-worker:$TAG" \
  "$ROOT/apps/worker"

echo "built agent-gateway:$TAG and agent-worker:$TAG"




