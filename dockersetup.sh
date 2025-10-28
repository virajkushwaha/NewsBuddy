#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update package list
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Add current user to the docker group
sudo usermod -aG docker "$USER"

# Enable Docker to start on boot
sudo systemctl enable docker

# Start Docker service
sudo systemctl start docker

echo "Docker installation and setup complete. Please log out and log back in for group changes to take effect."
