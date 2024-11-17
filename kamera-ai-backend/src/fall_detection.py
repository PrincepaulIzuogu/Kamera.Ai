# fall_detection.py

import numpy as np
import cv2
import base64
import mediapipe as mp
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
import math
import uvicorn

# Initialize FastAPI
app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Load the trained model
model_path = "/app/models/fall_detection_model.h5"
model = load_model(model_path)

def calculate_angle(shoulder, hip):
    """Calculate the angle between two points."""
    delta_y = hip[1] - shoulder[1]
    delta_x = hip[0] - shoulder[0]
    angle = math.atan2(delta_y, delta_x) * (180.0 / np.pi)
    return angle

def analyze_frame_logic(frame):
    """Analyze a single frame and predict if a fall is detected."""
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Extract positions of the shoulders and hips
        left_shoulder = (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y)
        right_shoulder = (landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x,
                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y)
        left_hip = (landmarks[mp_pose.PoseLandmark.LEFT_HIP].x,
                    landmarks[mp_pose.PoseLandmark.LEFT_HIP].y)
        right_hip = (landmarks[mp_pose.PoseLandmark.RIGHT_HIP].x,
                     landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y)

        # Calculate angles
        shoulder_midpoint = ((left_shoulder[0] + right_shoulder[0]) / 2,
                             (left_shoulder[1] + right_shoulder[1]) / 2)
        hip_midpoint = ((left_hip[0] + right_hip[0]) / 2,
                        (left_hip[1] + right_hip[1]) / 2)

        # Calculate the angle between the shoulder midpoint and the hip midpoint
        angle = calculate_angle(shoulder_midpoint, hip_midpoint)

        # Classify based on angle
        if angle < 30 or angle > 150:  # Horizontal posture detected
            return 1  # Fall detected
        else:
            # Continue with the trained model prediction if not horizontal
            landmarks_flat = [coord for landmark in landmarks for coord in [landmark.x, landmark.y, landmark.z]]
            input_data = np.array(landmarks_flat).reshape(1, -1)  # Reshape for the model input
            prediction = model.predict(input_data)
            return np.argmax(prediction)  # Return the class with the highest probability
    return None

@app.get("/")
async def read_root():
    return {"message": "Backend is running!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            print("Received message from client.")

            try:
                img_data = np.frombuffer(base64.b64decode(message), np.uint8)
                frame = cv2.imdecode(img_data, cv2.IMREAD_COLOR)

                prediction = analyze_frame_logic(frame)
                print("Prediction result:", prediction)

                if prediction is not None:
                    response = "Fall Detected!" if prediction == 1 else "No Fall"
                    await websocket.send_text(response)
            except Exception as e:
                print("Error processing frame:", e)

    except Exception as e:
        print("WebSocket connection error:", e)
    finally:
        await websocket.close()


# Command to run the backend server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
