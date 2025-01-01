#!/bin/bash

# Ensure environment variables are set
if [[ -z "$ACR_USERNAME" || -z "$ACR_PASSWORD" ]]; then
  echo "ACR_USERNAME and ACR_PASSWORD must be set"
  exit 1
fi

# Login to Docker using ACR credentials
echo "Logging in to Docker..."
echo $ACR_PASSWORD | docker login kameraaiacr.azurecr.io -u $ACR_USERNAME --password-stdin
if [[ $? -ne 0 ]]; then
  echo "Docker login failed"
  exit 1
fi

echo "Docker login successful"
