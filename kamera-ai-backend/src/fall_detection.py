import asyncio
import websockets
import numpy as np
import cv2
import base64
import mediapipe as mp
from tensorflow.keras.models import load_model
import math

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Load the trained model
model_path = "../kamera-ai-backend/models/fall_detection_model.h5"
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
        # Using stricter angle thresholds for fall detection
        if angle < 30 or angle > 150:  # Horizontal posture detected
            return 1  # Fall detected
        else:
            # Continue with the trained model prediction if not horizontal
            landmarks_flat = [coord for landmark in landmarks for coord in [landmark.x, landmark.y, landmark.z]]
            input_data = np.array(landmarks_flat).reshape(1, -1)  # Reshape for the model input
            prediction = model.predict(input_data)
            return np.argmax(prediction)  # Return the class with the highest probability
    return None

async def analyze_frame(websocket, path):
    """Analyze frames received from the client."""
    try:
        async for message in websocket:
            print("Received message from client:", message)

            # Convert the base64 string back to an image
            img_data = np.frombuffer(base64.b64decode(message), np.uint8)
            frame = cv2.imdecode(img_data, cv2.IMREAD_COLOR)

            # Analyze the frame
            prediction = analyze_frame_logic(frame)  # Call the analysis logic
            print("Prediction result:", prediction)

            if prediction is not None:
                response = "Fall Detected!" if prediction == 1 else "No Fall"
                await websocket.send(response)  # Send response back to client
                print("Sent message to client:", response)

    except websockets.exceptions.ConnectionClosed as e:
        print("Connection closed:", e)
    except Exception as e:
        print("An error occurred:", e)

# Start the WebSocket server
port = 5001  # You can change this to any port you want
start_server = websockets.serve(analyze_frame, 'localhost', port)

print(f"Starting WebSocket server on port {port}...")
print(f"WebSocket server URL: ws://localhost:{port}")  # Print the WebSocket URL

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
