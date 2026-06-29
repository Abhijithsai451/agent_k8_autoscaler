#!/usr/bin/env bash
# a local cluster can't see your docker daemon, so push the images in
set -euo pipefail

TAG="${TAG:-dev}"
CLUSTER="${CLUSTER:-agent}"

k3d image import "agent-gateway:$TAG" "agent-worker:$TAG" -c "$CLUSTER"

# kind instead of k3d
#   kind load docker-image "agent-gateway:$TAG" --name "$CLUSTER"
#   kind load docker-image "agent-worker:$TAG" --name "$CLUSTER"

echo "loaded images into cluster $CLUSTER"
