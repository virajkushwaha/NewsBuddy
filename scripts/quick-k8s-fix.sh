#!/bin/bash

echo "🔧 Quick Kubernetes setup for NewsBuddy..."

# Install Kind if not present
if ! command -v kind &> /dev/null; then
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
    chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind
fi

# Create cluster
kind create cluster --name newsbuddy

# Apply manifests with validation disabled
kubectl apply -f k8s/namespace.yaml --validate=false
kubectl apply -f k8s/configmap.yaml --validate=false
kubectl apply -f k8s/secrets.yaml --validate=false

echo "✅ Cluster ready! Run: kubectl get namespaces"