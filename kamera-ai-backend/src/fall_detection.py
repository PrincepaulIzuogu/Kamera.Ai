import os
import bcrypt
import smtplib
import random
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, WebSocket, Depends, Form, Request, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from tensorflow.keras.models import load_model
from pydantic import BaseModel, EmailStr, Field
import numpy as np
import cv2
import mediapipe as mp
import logging
import uvicorn


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fetch the database URL from environment variables
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:THD111@postgres:5432/kamera-db')  # Default PostgreSQL port is 5432
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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


# Base for SQLAlchemy models
Base = declarative_base()

# SQLAlchemy models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    initial = Column(String, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    gender = Column(String)
    position = Column(String)
    clinic_name = Column(String)
    location = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Token(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tokens")

User.tokens = relationship("Token", back_populates="user")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to hash the password using bcrypt
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

# Function to generate a random token
def generate_random_token(length: int = 15) -> str:
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))


# Function to send confirmation email
def send_confirmation_email_with_token(email: str, token: str):
    from_name = "Kamera.Ai"
    from_email = "baelee570@gmail.com"  # Replace with your email
    to_email = email
    msg = MIMEMultipart()
    msg['From'] = f"{from_name} <{from_email}>"
    msg['To'] = to_email
    msg['Subject'] = "Confirm Your Token"
    body = f"Your confirmation token is: {token}"
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, "bdta hlgx qfka njcv")  # Replace with your email password
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
        print(f"Token sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

# Pydantic model for registration request
class RegisterRequest(BaseModel):
    initial: str
    first_name: str
    last_name: str
    gender: str
    position: str
    clinic_name: str
    location: str
    email: EmailStr
    password: str
    confirm_password: str

# Define the Pydantic model for the token request
class TokenRequest(BaseModel):
    token_data: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    clinic_name: str

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=6, max_length=15)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Register user endpoint
@app.post("/register")
async def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    # Validate password match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Check if the email is already registered
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Hash the password
    hashed_password = hash_password(request.password)

    # Generate a random token
    token = generate_random_token()

    # Create a new user in the database
    db_user = User(
        initial=request.initial,
        first_name=request.first_name,
        last_name=request.last_name,
        gender=request.gender,
        position=request.position,
        clinic_name=request.clinic_name,
        location=request.location,
        email=request.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create a token record and associate it with the user
    db_token = Token(token=token, user_id=db_user.id)
    db.add(db_token)
    db.commit()

    # Send confirmation email
    send_confirmation_email_with_token(request.email, token)

    return {"message": "User created. Please check your email for the confirmation token."}

# Confirm email verification endpoint
@app.post("/confirm-token")
async def confirm_token(request: TokenRequest, db: Session = Depends(get_db)):
    db_token = db.query(Token).filter(Token.token == request.token_data).first()
    if db_token:
        user = db_token.user
        if user:
            user.is_verified = True
            db.delete(db_token)  # Remove token after confirmation
            db.commit()
            return {"message": "Token confirmed successfully"}
    raise HTTPException(status_code=400, detail="Invalid token")


@app.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email, User.clinic_name == request.clinic_name).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with this email and clinic name.")

    # Generate a reset token
    reset_token = generate_random_token(length=6)

    # Save the token in the database (could be a separate table or a field in User)
    db_token = Token(token=reset_token, user_id=user.id)
    db.add(db_token)
    db.commit()

    # Send the token via email
    send_confirmation_email_with_token(request.email, reset_token)

    return {"message": "Password reset token has been sent to your email."}


@app.post("/set-new-password")
async def set_new_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Check if the token exists
    db_token = db.query(Token).filter(Token.token == request.token).first()
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

    # Validate passwords match
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    # Fetch the associated user
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Update user's password
    hashed_password = hash_password(request.password)
    user.hashed_password = hashed_password

    # Delete the token after successful password reset
    db.delete(db_token)
    db.commit()

    return {"message": "Password successfully reset. You can now log in with your new password."}


@app.post("/sign-in")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Retrieve the user from the database
    db_user = db.query(User).filter(User.email == user.email).first()

    # Validate user existence and password
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Check if the email is verified
    if not db_user.is_verified:
        raise HTTPException(status_code=401, detail="Email not verified.")

    return {"message": "Login successful."}




@app.get("/")
async def read_root():
    return {"message": "Backend is running!"}




# Fall detection logic
def calculate_angle(shoulder, hip):
    """Calculate the angle between two points."""
    delta_y = hip[1] - shoulder[1]
    delta_x = hip[0] - shoulder[0]
    angle = np.arctan2(delta_y, delta_x) * (180.0 / np.pi)
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
