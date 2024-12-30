# kamera-ai-backend/Dockerfile

# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Install system dependencies for OpenCV and other required libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements.txt file into the container
COPY ./kamera-ai-backend/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code into the container
COPY . .

# Expose the port that the app runs on
EXPOSE 5001

# Command to run the backend server using Uvicorn
CMD ["uvicorn", "src.fall_detection:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]
