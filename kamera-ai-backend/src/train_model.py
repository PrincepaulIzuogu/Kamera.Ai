import os
import numpy as np
import csv
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical

def load_landmarks(filename):
    """Load landmarks from a CSV file."""
    landmarks = []
    with open(filename, mode='r') as file:
        reader = csv.reader(file)
        for row in reader:
            landmarks.append([float(coord) for coord in row])  # Convert string to float
    return np.array(landmarks)

def main():
    data_dir = "../kamera-ai-backend/data"  # Path to the data directory
    fall_landmarks_file = os.path.join(data_dir, "fall_landmarks.csv")
    no_fall_landmarks_file = os.path.join(data_dir, "no_fall_landmarks.csv")

    # Load landmarks from CSV files
    fall_landmarks = load_landmarks(fall_landmarks_file)
    no_fall_landmarks = load_landmarks(no_fall_landmarks_file)

    # Create labels
    fall_labels = np.ones(fall_landmarks.shape[0])  # Label 1 for falls
    no_fall_labels = np.zeros(no_fall_landmarks.shape[0])  # Label 0 for no falls

    # Combine data and labels
    X = np.vstack((fall_landmarks, no_fall_landmarks))
    y = np.concatenate((fall_labels, no_fall_labels))

    # Convert labels to one-hot encoding
    y = to_categorical(y, num_classes=2)

    # Split the dataset into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Build the model
    model = Sequential([
        Dense(128, activation='relu', input_shape=(X.shape[1],)),  # Adjust input shape
        Dense(64, activation='relu'),
        Dense(2, activation='softmax')  # Output layer for two classes (fall, no fall)
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))

    # Save the trained model
    model.save(os.path.join("..", "kamera-ai-backend", "models", "fall_detection_model.h5"))
    print("Model training complete and saved!")

if __name__ == "__main__":
    main()
