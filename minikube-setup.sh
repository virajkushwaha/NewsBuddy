#!/bin/bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube (container driver)
minikube start --driver=docker

# Enable ingress (optional)
minikube addons enable ingress

# Setup kubectl
sudo snap install kubectl --classic
