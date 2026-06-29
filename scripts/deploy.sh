#!/usr/bin/env bash
# applies Tier 1 in order. Cluster up, images loaded, Temporal installed, secret created.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
K8S="$ROOT/infra_k8s"

kubectl apply -f "$K8S/00-namespace.yaml"
kubectl apply -f "$K8S/01-configmap.yaml"
kubectl apply -f "$K8S/10-gateway-deployment.yaml"
kubectl apply -f "$K8S/20-worker-deployment.yaml"
kubectl apply -f "$K8S/30-cronjob-scheduled-run.yaml"

# optional, needs an ingress controller
#   kubectl apply -f "$K8S/11-gateway-ingress.yaml"

echo "Tier 1 applied"

# Tier 2, once Tier 1 is healthy and KEDA is installed
#   kubectl apply -f "$K8S/40-keda-worker-scaledobject.yaml"
#   kubectl apply -f "$K8S/41-gateway-hpa.yaml"
# fallback only, don't combine with 40
#   kubectl apply -f "$K8S/42-worker-hpa-fallback.yaml"
