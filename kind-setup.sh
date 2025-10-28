# Ensure Docker is installed and running
# Install KinD
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Create cluster
kind create cluster --name newsbuddy

# Setup kubectl
sudo snap install kubectl --classic



