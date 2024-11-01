import os
import cv2
import numpy as np
import mediapipe as mp
import csv

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

def analyze_video(video_path):
    """Analyze a video and extract landmarks."""
    cap = cv2.VideoCapture(video_path)
    all_landmarks = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)

        if results.pose_landmarks:
            landmarks = [landmark for landmark in results.pose_landmarks.landmark]
            landmarks_flat = [coord for landmark in landmarks for coord in [landmark.x, landmark.y, landmark.z]]
            all_landmarks.append(landmarks_flat)

    cap.release()
    return np.array(all_landmarks)

def save_landmarks_to_csv(landmarks, filename):
    """Save landmarks to a CSV file."""
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(landmarks)

def main():
    data_dir = "../kamera-ai-backend/data"  # Path to the data directory
    fall_videos_dir = os.path.join(data_dir, "fall_detection", "videos")
    no_fall_videos_dir = os.path.join(data_dir, "no_fall_detection", "videos")

    # Print the full paths for debugging
    print(f"Checking fall videos directory: {os.path.abspath(fall_videos_dir)}")
    print(f"Checking no-fall videos directory: {os.path.abspath(no_fall_videos_dir)}")

    # Check if the directories exist
    if not os.path.exists(fall_videos_dir) or not os.path.exists(no_fall_videos_dir):
        print("One or more video directories do not exist.")
        return

    # Analyze fall videos and save landmarks
    all_fall_landmarks = []
    for video_file in os.listdir(fall_videos_dir):
        video_path = os.path.join(fall_videos_dir, video_file)
        print(f"Analyzing {video_path}...")
        landmarks = analyze_video(video_path)
        all_fall_landmarks.extend(landmarks)

    # Save fall landmarks to CSV
    save_landmarks_to_csv(all_fall_landmarks, os.path.join(data_dir, "fall_landmarks.csv"))

    # Analyze no-fall videos and save landmarks
    all_no_fall_landmarks = []
    for video_file in os.listdir(no_fall_videos_dir):
        video_path = os.path.join(no_fall_videos_dir, video_file)
        print(f"Analyzing {video_path}...")
        landmarks = analyze_video(video_path)
        all_no_fall_landmarks.extend(landmarks)

    # Save no-fall landmarks to CSV
    save_landmarks_to_csv(all_no_fall_landmarks, os.path.join(data_dir, "no_fall_landmarks.csv"))

if __name__ == "__main__":
    main()
