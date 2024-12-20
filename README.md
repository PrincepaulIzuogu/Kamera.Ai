# Kamera.Ai

**Kamera.Ai** is an advanced application powered by a personalized pre-trained model designed to continuously monitor patients in smart clinic rooms. The system uses computer vision techniques to detect falls in real-time and instantly sends alerts, enabling rapid response and preventing further complications.

https://github.com/user-attachments/assets/0a3d1093-f05d-4171-8954-8f5275ce5041

The goal of **Kamera.Ai** is to provide enhanced patient safety by automating fall detection in healthcare environments, such as hospitals, clinics, and care homes. The application ensures that patients' well-being is constantly monitored, even when healthcare professionals are not around, helping to reduce fall-related injuries.

## Features

- **Real-time Fall Detection**: Continuously monitors patients' movements in the room using smart cameras and detects falls as they occur.
- **Instant Alerts**: Sends immediate notifications (SMS or email) to the healthcare team or caregivers in case of a detected fall.
- **Personalized Model**: The fall detection model is personalized for each clinic or room to adapt to specific environmental conditions and patient behavior.
- **Data Logging and Reporting**: Records fall incidents with timestamps and patient information, helping medical staff review and analyze trends.

## How it Works

Kamera.Ai uses a personalized pre-trained model to analyze video footage in real-time. The system relies on MediaPipe for pose estimation and uses an LSTM (Long Short-Term Memory) neural network model to detect potential falls based on the patients' body postures and movements. When a fall is detected, the application triggers an alert mechanism to notify the staff.

![Screenshot 2024-12-11 183013](https://github.com/user-attachments/assets/c5c7e824-6786-4c9b-a4ec-49fc3e5fc362)

### Steps:
1. **Video Streaming**: Cameras in smart clinic rooms stream the video to the application.
2. **Fall Detection**: The system processes each frame, looking for signs of a fall.
3. **Alerting**: If a fall is detected, the application immediately sends an alert.
4. **Logging**: The event is recorded for future analysis.

## Installation

To run Kamera.Ai on your local machine, follow these steps:

### Prerequisites

- Python 3.8+
- Docker (for containerized environments)
- Node.js & React (for frontend development)
- PostgreSQL (for database)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository/kamera-ai.git
   cd kamera-ai
