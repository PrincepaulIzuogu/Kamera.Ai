# Use a base image with Python 3.8 for dev container setup
FROM mcr.microsoft.com/vscode/devcontainers/python:0-3.8

# Install dependencies (Azure CLI, Docker, and jq)
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    docker.io \
    lsb-release \
    sudo

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Authenticate with Azure ACR using GitHub secrets
RUN echo "$ACR_PASSWORD" | az acr login --name $ACR_USERNAME --username $ACR_USERNAME --password-stdin

# Set up the working directory
WORKDIR /workspace

# Ensure Docker Compose is installed
RUN curl -L https://github.com/docker/compose/releases/download/v2.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose \
  && chmod +x /usr/local/bin/docker-compose
