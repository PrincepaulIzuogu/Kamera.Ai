import shutil
from pathlib import Path
import os
import csv
import bcrypt
import smtplib
import random
import string
from typing import Optional, List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, WebSocket, Depends, Form, Request, UploadFile, File, Form 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, LSTM, TimeDistributed,Dropout, Input 
from tensorflow.keras.optimizers import Adam
from pydantic import BaseModel, EmailStr, Field
import numpy as np
import tensorflow as tf
import cv2
import base64
import stripe
import mediapipe as mp
from mediapipe import solutions as mp_solutions
import logging
import uvicorn
from jose import JWTError, jwt
from jose.exceptions import JWTError
# Importing analysis and training modules
from src.analyze_videos import analyze_video, save_landmarks_to_csv
from src.train_model import main as train_model_main


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fetch the database URL from environment variables
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Set your Stripe API secret key
stripe.api_key = "sk_test_51PTo6n2MU8gPiBkp1zInYRfltX26e6CQ6JQZo0H2tJ47LWh2R7Dmw0phfFX9fBWU9VC3TBhgQbTZcezZVL2tcNYj001sdf3uar"



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
mp_pose = mp_solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    enable_segmentation=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


# Base for SQLAlchemy models
Base = declarative_base()


# Define a secret key for signing JWT tokens
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

# Define the OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Base directory for the application
BASE_DIR = Path(__file__).resolve().parent

# Define directory structure
UPLOAD_DIR = BASE_DIR / "uploaded_videos"
FALL_VIDEOS_DIR = UPLOAD_DIR / "fall"
NON_FALL_VIDEOS_DIR = UPLOAD_DIR / "non_fall"
LANDMARKS_DIR = BASE_DIR / "landmarks"
MODELS_DIR = BASE_DIR / "models"

# Ensure base directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
LANDMARKS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def create_test_directories(test_id: int):
    """
    Create test-specific directories for videos, landmarks, and models.

    Args:
        test_id (int): Unique identifier for the test.
    Returns:
        dict: Paths to test-specific directories.
    """
    test_fall_dir = FALL_VIDEOS_DIR / str(test_id)
    test_non_fall_dir = NON_FALL_VIDEOS_DIR / str(test_id)
    test_landmarks_dir = LANDMARKS_DIR / str(test_id)
    test_models_dir = MODELS_DIR / str(test_id)

    # Create directories if they do not exist
    test_fall_dir.mkdir(parents=True, exist_ok=True)
    test_non_fall_dir.mkdir(parents=True, exist_ok=True)
    test_landmarks_dir.mkdir(parents=True, exist_ok=True)
    test_models_dir.mkdir(parents=True, exist_ok=True)

    return {
        "fall_videos": test_fall_dir,
        "non_fall_videos": test_non_fall_dir,
        "landmarks": test_landmarks_dir,
        "models": test_models_dir,
    }


def decode_access_token(token: str):
    """
    Decode a JWT token to extract the payload.

    Args:
        token (str): The JWT token.

    Returns:
        dict: The payload extracted from the token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=401, detail="Could not validate credentials"
        ) from e


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

# Relationship to rooms
    rooms = relationship("Room", back_populates="user")
    dashboard_data = relationship("DashboardData", back_populates="user", uselist=False)
    # Define the relationship to the Subscription model
    subscription = relationship('Subscription', back_populates='user', uselist=False)



class Token(Base):
    __tablename__ = "tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="tokens")

User.tokens = relationship("Token", back_populates="user")

# FallDetectionTest model
# Models
class FallDetectionTest(Base):
    __tablename__ = "fall_detection_tests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Video
    videos = relationship("Video", back_populates="fall_detection_test")
    fall_videos = relationship("FallVideo", back_populates="fall_detection_test")

# New FallVideo model
class FallVideo(Base):
    __tablename__ = "fall_videos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)  # Add start time
    end_time = Column(Float, nullable=False)    # Add end time
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Foreign key linking the video to a FallDetectionTest
    fall_detection_test_id = Column(Integer, ForeignKey("fall_detection_tests.id"))
    fall_detection_test = relationship("FallDetectionTest", back_populates="fall_videos")



class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Foreign key linking the video to a FallDetectionTest
    fall_detection_test_id = Column(Integer, ForeignKey("fall_detection_tests.id"))
    fall_detection_test = relationship("FallDetectionTest", back_populates="videos")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, index=True)
    floor = Column(String)
    total_bed = Column(Integer, index=True)
    building = Column(String)
    status = Column(String)
    date_registered = Column(DateTime, default=datetime.utcnow)
    last_action = Column(String)

    # CCTV specific fields
    cctv_ip = Column(String, index=True)
    cctv_port = Column(Integer)
    cctv_username = Column(String)
    cctv_password = Column(String)
    stream_url = Column(String)

    # Foreign key to link room to user
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationship to the User
    user = relationship("User", back_populates="rooms")


class DashboardData(Base):
    __tablename__ = "dashboard_data"

    id = Column(Integer, primary_key=True, index=True)
    total_falls = Column(Integer, default=0)
    total_rooms = Column(Integer, default=0)
    user_guide_access = Column(Boolean, default=True)

    # Foreign key to link dashboard data to user
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationship to User
    user = relationship("User", back_populates="dashboard_data")


class Subscription(Base):
    __tablename__ = 'subscriptions'

    id = Column(Integer, primary_key=True, index=True)
    plan = Column(String, index=True)
    rooms = Column(String, index=True)
    price = Column(String, index=True)  # Store as string (e.g. "$100/month")
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to User
    user = relationship('User', back_populates='subscription')

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



def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        logger.info(f"Validating token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials.")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        return user
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired.")
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")





@app.post("/token", response_model=dict)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not bcrypt.checkpw(form_data.password.encode("utf-8"), user.hashed_password.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Email not verified.")

    # Generate token with string sub
    token_data = {
        "sub": str(user.id),
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    logger.info(f"Generated token for user {user.id}: {access_token}")
    return {"access_token": access_token, "token_type": "bearer"}

# Update get_current_user to handle JWTError
def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        logger.info(f"Validating token: {token}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")
        if not user_id or not isinstance(user_id, str):
            raise HTTPException(status_code=401, detail="Invalid authentication credentials.")

        # Convert user_id to integer for database queries, if necessary
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        return user
    except jwt.JWTError as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")




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




# Function to send email
def send_appointment_email(name: str, clinic: str, time: str, email: str):
    try:
        subject = "New Appointment Scheduled"
        body = f"""
        Dear Team,

        A new appointment has been scheduled.

        Name: {name}
        Clinic: {clinic}
        Time: {time}
        Email: {email}

        Please follow up as needed.

        Best regards,
        Kamera.Ai
        """
        from_name = "Kamera.Ai Appointments"
        from_email = "baelee570@gmail.com"  # Replace with your email
        password = "bdta hlgx qfka njcv"  # Replace with your email password
        recipient_email = "baelee570@gmail.com"  # Replace with your recipient email

        msg = MIMEMultipart()
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Connect to SMTP server and send email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()

        logger.info(f"Appointment email sent to {recipient_email} for {name}.")
    except Exception as e:
        logger.error(f"Failed to send appointment email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send appointment email.")



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

# Pydantic models
class FallDetectionTestRequest(BaseModel):
    name: str
    email: EmailStr

    class Config:
        orm_mode = True


class VideoUploadRequest(BaseModel):
    test_id: int

    class Config:
        orm_mode = True

# New Pydantic model for FallVideo
class FallVideoUploadRequest(BaseModel):
    test_id: int
    start_time: float
    end_time: float

    class Config:
        orm_mode = True


# Define a Pydantic model for the request body
class CreateModelRequest(BaseModel):
    test_id: int


class AppointmentRequest(BaseModel):
    name: str
    clinic: str
    time: str
    email: EmailStr



class RoomRequest(BaseModel):
    number: str
    floor: str
    building: str
    status: str
    cctv_ip: str
    cctv_port: int
    cctv_username: str
    cctv_password: str
    stream_url: str

    class Config:
        orm_mode = True

# Pydantic model for Dashboard
class DashboardResponse(BaseModel):
    total_falls: int
    total_rooms: int
    user_guide_access: str

    class Config:
        orm_mode = True


# Model for the response of the falls over time
class FallsOverTimeResponse(BaseModel):
    time: str
    falls: int

    class Config:
        orm_mode = True

# Model for active patients (rooms)
class ActivePatientsData(BaseModel):
    room_number: str
    floor: str
    status: str
    cctv_ip: str  # Add other relevant fields related to the room as necessary
    total_beds: int  # Total beds in each room

    class Config:
        orm_mode = True


class SubscriptionCreate(BaseModel):
    plan: str
    rooms: str
    price: str
    payment_method: str

    class Config:
        orm_mode = True

class SubscriptionResponse(BaseModel):
    subscription_status: str
    message: Optional[str] = None


# Model for Subscription Status Response
class SubscriptionStatusResponse(BaseModel):
    subscription_status: str

    class Config:
        orm_mode = True

# Model for Subscription Details Response
class SubscriptionDetailsResponse(BaseModel):
    plan: str
    rooms: str
    price: str
    created_at: datetime

    class Config:
        orm_mode = True

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    email: str
    gender: str
    clinic_name: str
    location: str
    created_at: datetime

    class Config:
        orm_mode = True



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

    # Generate a JWT token with sub as a string
    token_data = {
        "sub": str(db_user.id),  # Convert user ID to string
        "exp": datetime.utcnow() + timedelta(hours=24),  # Set token expiration
    }
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    # Return the user data along with the token
    return {
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "clinicName": db_user.clinic_name,
            "firstName": db_user.first_name,
            "lastName": db_user.last_name,
        },
    }



@app.get("/")
async def read_root():
    return {"message": "Backend is running!"}


# Endpoint to register a fall detection test
@app.post("/fall-detection-test")
async def fall_detection_test(request: FallDetectionTestRequest, db: Session = Depends(get_db)):
    try:
        # Use the validated request data directly
        name = request.name
        email = request.email

        # Check if the email is already registered for a fall detection test
        existing_test = db.query(FallDetectionTest).filter(FallDetectionTest.email == email).first()
        if existing_test:
            # If email is already registered, return the existing test_id
            return {"message": "Email already registered for fall detection test.", "test_id": existing_test.id}

        # Create a new fall detection test entry
        new_test = FallDetectionTest(name=name, email=email)
        db.add(new_test)
        db.commit()
        db.refresh(new_test)

        # Return a success message and the test_id of the newly created test
        return {"message": "Fall detection test registration successful.", "test_id": new_test.id}

    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    


# Endpoint to upload a video and link it to a FallDetectionTest
@app.post("/upload-video")
async def upload_video(
    test_id: int = Form(...),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
    is_fall: bool = Form(False),
):
    """
    Upload a video and save it in the appropriate directory (fall or non-fall).
    """
    try:
        logger.info(f"Uploading video for test_id: {test_id}, is_fall: {is_fall}")

        # Ensure test-specific directories exist
        test_dirs = create_test_directories(test_id)
        video_dir = test_dirs["fall_videos"] if is_fall else test_dirs["non_fall_videos"]

        video_filename = f"{test_id}_{video.filename}"
        video_path = video_dir / video_filename

        # Save the video file
        with video_path.open("wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        # Save video metadata in the database
        video_metadata = {
            "filename": video_filename,
            "filepath": str(video_path),
            "fall_detection_test_id": test_id,
        }

        # Use the correct table based on video type
        if is_fall:
            new_video = FallVideo(**video_metadata)
        else:
            new_video = Video(**video_metadata)

        db.add(new_video)
        db.commit()
        db.refresh(new_video)

        return {"message": "Video uploaded successfully.", "test_id": test_id, "is_fall": is_fall}

    except Exception as e:
        logger.error(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    



@app.post("/upload-fall-video")
async def upload_fall_video(
    test_id: int = Form(...),
    start_time: float = Form(...),
    end_time: float = Form(...),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a fall video and link it to a FallDetectionTest.
    Saves the video in the fall-specific directory for the given test_id.
    """
    try:
        logger.info(f"Received test_id: {test_id}")
        logger.info(f"Received start_time: {start_time}, end_time: {end_time}")
        logger.info(f"Received video filename: {video.filename}")

        # Validate start_time and end_time
        if start_time < 0 or end_time <= start_time:
            raise HTTPException(status_code=400, detail="Invalid start_time or end_time.")

        # Check if the test_id exists
        test = db.query(FallDetectionTest).filter(FallDetectionTest.id == test_id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Fall detection test not found.")

        # Create test-specific directories
        test_dirs = create_test_directories(test_id)
        fall_videos_dir = test_dirs["fall_videos"]

        # Save the video file in the fall directory
        video_filename = f"{test_id}_{video.filename}"
        video_path = fall_videos_dir / video_filename
        with video_path.open("wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        # Save metadata to the database
        new_fall_video = FallVideo(
            filename=video_filename,
            filepath=str(video_path),
            fall_detection_test_id=test_id,
            start_time=start_time,
            end_time=end_time,
        )
        db.add(new_fall_video)
        db.commit()
        db.refresh(new_fall_video)

        logger.info(f"Fall video successfully uploaded and saved: {video_path}")
        return {
            "message": "Fall video uploaded and linked successfully.",
            "test_id": test_id,
            "start_time": start_time,
            "end_time": end_time,
        }

    except HTTPException as http_exc:
        logger.error(f"HTTP error during fall video upload: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error during fall video upload: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")



# -------------------- Analyze Video -------------------- #

def analyze_video(video_path: Path):
    """
    Analyze a video and extract pose landmarks from each frame.

    Args:
        video_path (Path): Path to the video file.

    Returns:
        List: Extracted pose landmarks from the video.
    """
    logger.info(f"Processing full video: {video_path}")

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")

    landmarks = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            frame_landmarks = [
                landmark.x for landmark in results.pose_landmarks.landmark
            ] + [
                landmark.y for landmark in results.pose_landmarks.landmark
            ] + [
                landmark.z for landmark in results.pose_landmarks.landmark
            ]
            landmarks.append(frame_landmarks)

    cap.release()
    logger.info(f"Completed video analysis for: {video_path}")
    return landmarks


# -------------------- Save Landmarks to CSV -------------------- #

def save_landmarks_to_csv(landmarks, file_path: Path):
    """
    Save landmarks to a CSV file.

    Args:
        landmarks (List): List of landmarks.
        file_path (Path): Path to the CSV file.
    """
    with file_path.open("w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(landmarks)
    logger.info(f"Landmarks saved to: {file_path}")


# -------------------- Train Model -------------------- #

def train_model(fall_csv_path: Path, non_fall_csv_path: Path):
    """
    Train the model using landmarks from fall and non-fall videos.

    Args:
        fall_csv_path (Path): Path to the fall landmarks CSV.
        non_fall_csv_path (Path): Path to the non-fall landmarks CSV.

    Returns:
        Model: Trained Keras model.
    """
    logger.info(f"Training model with data: {fall_csv_path} and {non_fall_csv_path}")

    # Load data from CSV files
    fall_data = load_csv(fall_csv_path)
    non_fall_data = load_csv(non_fall_csv_path)

    # Combine data and labels
    X = np.array(fall_data + non_fall_data)
    y = np.array([1] * len(fall_data) + [0] * len(non_fall_data))

    # Dynamically calculate timesteps and features per frame
    num_features = X.shape[1]  # Total number of features in each sample
    timesteps = 10  # Define the desired number of timesteps

    if num_features % timesteps != 0:
        # Adjust features to match timesteps by truncating or padding
        num_features_per_timestep = num_features // timesteps * timesteps
        logger.warning(f"Truncating features to {num_features_per_timestep} to match timesteps.")
        X = X[:, :num_features_per_timestep]

    # Reshape data for LSTM input
    num_features_per_frame = num_features // timesteps
    X = X.reshape(-1, timesteps, num_features_per_frame)

    logger.info("Initializing neural network with TimeDistributed and LSTM layers...")

    # Define the model
    model = Sequential([
        LSTM(64, return_sequences=False, input_shape=(timesteps, num_features_per_frame)),
        Dropout(0.3),
        Dense(64, activation="relu"),
        Dropout(0.2),
        Dense(1, activation="sigmoid")  # Binary classification
    ])

    model.compile(optimizer=Adam(learning_rate=0.001), loss="binary_crossentropy", metrics=["accuracy"])

    logger.info("Starting model training...")
    model.fit(X, y, epochs=10, batch_size=16, verbose=1)
    logger.info("Model training completed.")
    return model


# -------------------- Helper Functions -------------------- #

def load_csv(file_path: Path):
    """
    Load data from a CSV file.

    Args:
        file_path (Path): Path to the CSV file.

    Returns:
        List: Loaded data.
    """
    data = []
    with file_path.open(mode="r") as csv_file:
        reader = csv.reader(csv_file)
        for row in reader:
            data.append([float(value) for value in row])
    return data


def save_trained_model(model, save_path: Path):
    """
    Save the trained model to the specified path.

    Args:
        model: Trained Keras model object.
        save_path: Path to save the model.
    """
    model.save(save_path)
    logger.info(f"Model successfully saved at: {save_path}")


# -------------------- Create Model Endpoint -------------------- #

@app.post("/create-model")
async def create_model(request: CreateModelRequest, db: Session = Depends(get_db)):
    """
    Analyze videos and create a model based on the data.
    """
    test_id = request.test_id
    logger.info(f"Creating model for test_id: {test_id}")

    try:
        test_dirs = create_test_directories(test_id)

        fall_videos = db.query(FallVideo).filter(FallVideo.fall_detection_test_id == test_id).all()
        non_fall_videos = db.query(Video).filter(Video.fall_detection_test_id == test_id).all()

        if not fall_videos or not non_fall_videos:
            raise HTTPException(status_code=404, detail="Videos for the test ID are missing.")

        fall_landmarks = []
        for video in fall_videos:
            video_path = Path(video.filepath)
            fall_landmarks.extend(analyze_video(video_path))

        non_fall_landmarks = []
        for video in non_fall_videos:
            video_path = Path(video.filepath)
            non_fall_landmarks.extend(analyze_video(video_path))

        fall_csv_path = test_dirs["landmarks"] / "fall_landmarks.csv"
        non_fall_csv_path = test_dirs["landmarks"] / "non_fall_landmarks.csv"
        save_landmarks_to_csv(fall_landmarks, fall_csv_path)
        save_landmarks_to_csv(non_fall_landmarks, non_fall_csv_path)

        trained_model = train_model(fall_csv_path, non_fall_csv_path)
        model_save_path = test_dirs["models"] / "fall_detection_model.keras"
        save_trained_model(trained_model, model_save_path)

        return {"message": "Model created successfully.", "model_path": str(model_save_path)}

    except Exception as e:
        logger.error(f"Error creating model: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")



def send_emergency_email(test_id: int, db: Session):
    """
    Send an emergency email notification when a fall is detected.

    Args:
        test_id (int): The ID of the current fall detection test.
        db (Session): Database session to query for email.
    """
    try:
        # Fetch the email from the fall_detection_tests table
        test_record = db.query(FallDetectionTest).filter(FallDetectionTest.id == test_id).first()
        if not test_record:
            logger.error(f"No record found for test_id: {test_id}. Cannot send email.")
            return
        
        recipient_email = test_record.email
        subject = "Emergency Alert: Fall Detected"
        body = (
            f"Dear User,\n\n"
            f"A fall has been detected during the fall detection test (ID: {test_id}).\n"
            f"Please check on the situation immediately.\n\n"
            f"Best regards,\nKamera.Ai Team"
        )

        # Setup email
        from_name = "Kamera.Ai Emergency"
        from_email = "baelee570@gmail.com"  # Replace with your email
        password = "bdta hlgx qfka njcv"  # Replace with your email password
        
        msg = MIMEMultipart()
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        # Send email
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Emergency email sent to {recipient_email} for test_id {test_id}.")
    except Exception as e:
        logger.error(f"Failed to send emergency email for test_id {test_id}: {e}")



# WebSocket for personalized fall detection
@app.websocket("/ws/personalised-fall-model/{test_id}")
async def websocket_endpoint(websocket: WebSocket, test_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    logger.info(f"WebSocket connection initiated for test_id: {test_id}")

    # Path to the model specific to the test_id
    model_path = MODELS_DIR / str(test_id) / "fall_detection_model.keras"
    model = None

    # Attempt to load the personalized model
    if model_path.exists():
        try:
            model = load_model(model_path)
            logger.info(f"Model for test_id {test_id} loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading model for test_id {test_id}: {e}")
            await websocket.send_text(f"Error loading model for test_id {test_id}: {e}")
            model = None

    try:
        while True:
            try:
                # Receive frame data from the client
                message = await websocket.receive_text()
                img_data = np.frombuffer(base64.b64decode(message), np.uint8)
                frame = cv2.imdecode(img_data, cv2.IMREAD_COLOR)

                # Calculate fall based on posture
                fall_detected = analyze_fall_by_posture(frame)

                if fall_detected:
                    response = "Fall Detected!"
                    # Send emergency email
                    send_emergency_email(test_id, db)
                elif model:
                    prediction = analyze_frame_with_model(frame, model)
                    response = "Fall Detected!" if prediction == 1 else "No Fall"
                else:
                    response = "No Fall"

                await websocket.send_text(response)

            except Exception as e:
                logger.error(f"Error processing frame for test_id {test_id}: {e}")
                await websocket.send_text(f"Error processing frame: {e}")
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for test_id: {test_id}")
    except Exception as e:
        logger.error(f"WebSocket connection error for test_id {test_id}: {e}")
    finally:
        await websocket.close()
        logger.info(f"WebSocket connection closed for test_id: {test_id}")



def analyze_fall_by_posture(frame):
    """
    Analyze a single frame to determine if a fall is detected based on posture.

    Args:
        frame: A single frame from the video.

    Returns:
        bool: True if a fall is detected, False otherwise.
    """
    try:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            # Extract key landmarks
            landmarks = results.pose_landmarks.landmark
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]

            # Calculate midpoints of shoulders and hips
            shoulder_midpoint = ((left_shoulder.x + right_shoulder.x) / 2,
                                 (left_shoulder.y + right_shoulder.y) / 2)
            hip_midpoint = ((left_hip.x + right_hip.x) / 2,
                            (left_hip.y + right_hip.y) / 2)

            # Calculate angle between shoulder and hip midpoints
            delta_y = hip_midpoint[1] - shoulder_midpoint[1]
            delta_x = hip_midpoint[0] - shoulder_midpoint[0]
            angle = np.arctan2(delta_y, delta_x) * (180.0 / np.pi)

            # Check for horizontal or scattered joints
            if angle < 30 or angle > 150:  # Angle indicates horizontal posture
                logger.info("Fall detected based on posture.")
                return True

        return False  # No fall detected based on posture
    except Exception as e:
        logger.error(f"Error in analyze_fall_by_posture: {e}")
        return False


def analyze_frame_with_model(frame, model, timesteps=10):
    """
    Analyze a single frame using the personalized model.

    Args:
        frame: A single frame from the video.
        model: The trained model to predict falls.
        timesteps (int): Number of timesteps expected by the model.

    Returns:
        int: Always 0 (No Fall).
    """
    try:
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            # Extract landmarks for prediction
            landmarks = results.pose_landmarks.landmark
            landmarks_flat = [
                coord for landmark in landmarks
                for coord in [landmark.x, landmark.y, landmark.z]
            ]

            # Determine the number of features per frame
            num_features_per_frame = len(landmarks_flat) // timesteps

            # Check if landmarks_flat can fit into the timesteps structure
            if len(landmarks_flat) % timesteps != 0:
                logger.warning("Truncating data to fit timesteps requirement.")
                landmarks_flat = landmarks_flat[:timesteps * num_features_per_frame]

            # Reshape the data to match the model's expected input shape
            input_data = np.array(landmarks_flat).reshape(1, timesteps, num_features_per_frame)

            # Predict using the model (default to No Fall)
            prediction = model.predict(input_data)
            logger.info("Model prediction successful. Always returning No Fall.")
            return 0  # Always return 0 (No Fall)

        logger.info("No pose landmarks detected. Defaulting to no fall.")
        return 0  # Default to no fall if no landmarks are detected
    except Exception as e:
        logger.error(f"Error in analyze_frame_with_model: {e}")
        return 0


@app.delete("/delete-data/{test_id}")
async def delete_data(test_id: int, db: Session = Depends(get_db)):
    """
    Delete all data associated with a given test ID.

    Args:
        test_id (int): The ID of the test to delete.
        db (Session): Database session.
    """
    try:
        # Delete data from the database
        db.query(FallVideo).filter(FallVideo.fall_detection_test_id == test_id).delete()
        db.query(Video).filter(Video.fall_detection_test_id == test_id).delete()
        db.query(FallDetectionTest).filter(FallDetectionTest.id == test_id).delete()
        db.commit()

        # Delete associated directories
        test_dirs = create_test_directories(test_id)
        for dir_path in test_dirs.values():
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)

        logger.info(f"All data associated with test_id {test_id} has been deleted.")
        return {"message": "All data deleted successfully."}

    except Exception as e:
        logger.error(f"Error deleting data for test_id {test_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete data.")


# Endpoint to handle appointment scheduling
@app.post("/schedule-appointment")
async def schedule_appointment(request: AppointmentRequest):
    try:
        # Extract data from the request
        name = request.name
        clinic = request.clinic
        time = request.time
        email = request.email

        # Log received data
        logger.info(f"Received appointment request: {name}, {clinic}, {time}, {email}")

        # Send email
        send_appointment_email(name, clinic, time, email)

        return {"message": "Appointment scheduled successfully."}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during appointment scheduling: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
    

    
@app.get("/api/dashboard")
async def get_dashboard_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch dashboard data and include clinic_name from the Users table.
    """
    # Retrieve the clinic_name directly from the user object
    clinic_name = user.clinic_name

    # Since DashboardData table might be empty, return default values for the rest
    dashboard_data = {
        "total_falls": 0,
        "total_rooms": 0,
        "subscription_status": "Unsubscribed",  # Default or fallback value
        "user_guide_access": "Available",  # Default or fallback value
        "clinic_name": clinic_name,  # Retrieved from the authenticated user
    }

    return dashboard_data


## Endpoint to fetch rooms
@app.get("/api/rooms")
async def get_rooms(db: Session = Depends(get_db)):
    logger.info("Received request for /api/rooms")
    try:
        rooms = db.query(Room).all()
        logger.info(f"Fetched {len(rooms)} rooms from the database")
        if not rooms:
            logger.warning("No rooms found in the database.")
            return []  # Return an empty list instead of raising an error
        return rooms
    except Exception as e:
        logger.error(f"Error fetching rooms: {e}")
        raise HTTPException(status_code=500, detail="Error fetching rooms")
    



 #Endpoint for /api/falls-over-time
@app.get("/api/falls-over-time")
async def get_falls_over_time(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch total falls over time from the DashboardData table for the authenticated user.
    """
    # Retrieve the user's dashboard data (total_falls column)
    dashboard_data = db.query(DashboardData).filter(DashboardData.user_id == user.id).first()

    if not dashboard_data:
        logger.warning(f"No dashboard data found for user {user.id}. Returning default values.")
        return {"time": "No Data", "falls": 0}  # Return default value if no data is found

    logger.info(f"Fetched total falls: {dashboard_data.total_falls} for user {user.id}")
    return {"time": "Current", "falls": dashboard_data.total_falls}


@app.get("/api/active-patients")
async def get_active_patients(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch all rooms (active patients) for the authenticated user from the Room table
    and calculate the total number of beds across all rooms.
    """
    # Retrieve rooms for the authenticated user
    rooms = db.query(Room).filter(Room.user_id == user.id).all()

    if not rooms:
        logger.warning(f"No rooms found for user {user.id}. Returning an empty list.")
        return []

    logger.info(f"Fetched {len(rooms)} rooms for user {user.id}")

    # Calculate total beds across all rooms
    total_beds = sum(room.total_bed for room in rooms)

    # Prepare response data
    active_patients = [
        {
            "room_number": room.number,
            "floor": room.floor,
            "status": room.status,
            "cctv_ip": room.cctv_ip,
            "total_beds": room.total_bed  # Add the total beds for each room
        }
        for room in rooms
    ]
    
    # Optionally, you can include total_beds in the response
    response = {
        "total_beds": total_beds,  # Total number of beds across all rooms
        "rooms": active_patients
    }

    return response



# Endpoint to handle the subscription process
@app.post("/api/create-subscription")
async def create_subscription(
    subscription: SubscriptionCreate, db: Session = Depends(get_db)
):
    try:
        # Create a payment method using Stripe
        # Here, you would add Stripe's payment creation logic using payment_method
        payment_method = subscription.payment_method  # Assuming payment_method is provided from frontend

        # Calculate price based on the selected rooms and plan
        price = subscription.price

        # Create the subscription record in the database
        user = db.query(User).filter(User.id == 1).first()  # Fetch user by ID, replace 1 with the authenticated user's ID

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_subscription = Subscription(
            plan=subscription.plan,
            rooms=subscription.rooms,
            price=price,
            user_id=user.id
        )

        db.add(new_subscription)
        db.commit()
        db.refresh(new_subscription)

        # Simulate Stripe's response for active subscription
        subscription_status = "active"

        return {"subscription_status": subscription_status, "message": "Subscription successful!"}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# Endpoint to get subscription details (GET request example)
@app.get("/api/subscription")
async def get_subscription(db: Session = Depends(get_db)):
    try:
        # Fetch user and subscription details
        user = db.query(User).filter(User.id == 1).first()  # Replace 1 with the authenticated user's ID
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()

        if not subscription:
            return {"message": "No active subscription found."}

        # Return subscription details
        return {
            "plan": subscription.plan,
            "rooms": subscription.rooms,
            "price": subscription.price,
            "created_at": subscription.created_at
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subscription details: {str(e)}")
    

@app.get("/api/subscription-status")
async def get_subscription_status(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Check if the user is subscribed or not.
    """
    subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    
    if subscription:
        return {"subscription_status": "Subscribed"}
    else:
        return {"subscription_status": "Unsubscribed"}

@app.get("/api/subscription-details")
async def get_subscription_details(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch the subscription details for the authenticated user.
    """
    subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()

    if not subscription:
        # Return default values for unsubscribed users
        return {
            "plan": "Unsubscribed",
            "rooms": "Unsubscribed",
            "price": "Unsubscribed",
            "created_at": "Unsubscribed"
        }

    return {
        "plan": subscription.plan,
        "rooms": subscription.rooms,
        "price": subscription.price,
        "created_at": subscription.created_at
    }


# Endpoint to get the user's profile
@app.get("/api/profile", response_model=UserProfile)
async def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Fetch the profile details of the authenticated user.
    """
    user_data = db.query(User).filter(User.id == user.id).first()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        gender=user_data.gender,
        clinic_name=user_data.clinic_name,
        location=user_data.location,
        created_at=user_data.created_at,
    )


@app.post("/api/profile", response_model=UserProfile)
async def update_profile(profile_data: UserProfile, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Update the profile details of the authenticated user.
    """
    user_data = db.query(User).filter(User.id == user.id).first()
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_data.first_name = profile_data.first_name
    user_data.last_name = profile_data.last_name
    user_data.email = profile_data.email
    user_data.gender = profile_data.gender
    user_data.clinic_name = profile_data.clinic_name
    user_data.location = profile_data.location

    db.commit()
    db.refresh(user_data)

    return UserProfile(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        gender=user_data.gender,
        clinic_name=user_data.clinic_name,
        location=user_data.location,
        created_at=user_data.created_at,
    )
