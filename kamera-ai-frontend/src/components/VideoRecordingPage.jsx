import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose'; // Import Pose for pose detection
import '../styles/VideoRecordingPage.css';
import nonFallVoice from '../voicevid/nonfallvoice.mp4'; // Import the audio file

const VideoRecordingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [videoBlob, setVideoBlob] = useState(null); // Store recorded video data
    const [showProceedButton, setShowProceedButton] = useState(false); // Control visibility of the Proceed button
    const [isSaveDisabled, setIsSaveDisabled] = useState(true); // Disable Save button initially
    const [isStartDisabled, setIsStartDisabled] = useState(false); // Disable Start button after starting
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioRef = useRef(new Audio(nonFallVoice)); // Use the imported audio file
    const hasPlayedAudio = useRef(false); // Track if audio has been played
    const navigate = useNavigate();
    const { id: testId } = useParams(); // Grab the test_id from the URL params
    const mediaRecorderRef = useRef(null); // Ref for the MediaRecorder instance
    const chunksRef = useRef([]); // Store video data chunks

    useEffect(() => {
        // Play the voicemail audio only once when the page loads
        if (!hasPlayedAudio.current) {
            audioRef.current.play();
            hasPlayedAudio.current = true; // Set to true to prevent re-playing audio
        }

        // Initialize pose detection and webcam when recording starts
        if (isRecording) {
            const videoElement = videoRef.current;
            const canvasElement = canvasRef.current;

            if (!videoElement || !canvasElement) {
                console.error("Video or Canvas element is not available.");
                return;
            }

            const ctx = canvasElement.getContext('2d');
            const pose = new Pose({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            const getWebcamStream = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoElement.srcObject = stream;

                    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

                    mediaRecorderRef.current.ondataavailable = (e) => {
                        chunksRef.current.push(e.data); // Store video data
                    };

                    mediaRecorderRef.current.onstop = () => {
                        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                        setVideoBlob(blob); // Store video blob
                    };

                    mediaRecorderRef.current.start();

                    // Wait until video metadata is loaded
                    await new Promise((resolve) => {
                        videoElement.onloadedmetadata = () => {
                            videoElement.play();
                            canvasElement.width = videoElement.videoWidth;
                            canvasElement.height = videoElement.videoHeight;
                            resolve();
                        };
                    });
                } catch (error) {
                    console.error("Error accessing webcam:", error);
                    alert('Camera access failed. Please check your permissions.');
                }
            };

            getWebcamStream();

            pose.onResults((results) => {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear previous frame
                ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height); // Draw video frame

                if (results.poseLandmarks) {
                    results.poseLandmarks.forEach((landmark) => {
                        ctx.beginPath();
                        ctx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
                        ctx.fillStyle = 'red';
                        ctx.fill();
                    });

                    for (const connection of POSE_CONNECTIONS) {
                        const [from, to] = connection;
                        ctx.beginPath();
                        ctx.moveTo(
                            results.poseLandmarks[from].x * canvasElement.width,
                            results.poseLandmarks[from].y * canvasElement.height
                        );
                        ctx.lineTo(
                            results.poseLandmarks[to].x * canvasElement.width,
                            results.poseLandmarks[to].y * canvasElement.height
                        );
                        ctx.strokeStyle = 'blue';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            });

            return () => {
                if (videoElement.srcObject) {
                    const tracks = videoElement.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                }
                pose.close();
            };
        }
    }, [isRecording]);

    const handleStartRecording = () => {
        setIsRecording(true);
        setMessage('Recording started... Please follow the instructions.');
        setIsStartDisabled(true); // Disable Start button
        setShowProceedButton(false); // Hide Proceed button when starting a new recording
        setTimeout(() => setIsSaveDisabled(false), 2000); // Enable Save button after 2 seconds
    };

    const handleSaveRecording = () => {
        if (!mediaRecorderRef.current) return;

        setIsRecording(false);
        setMessage('Recording stopped.');
        mediaRecorderRef.current.stop(); // Stop recording
        setIsSaveDisabled(true); // Disable Save button after clicking
        setShowProceedButton(true); // Show Proceed button
    };

    const handleProceed = () => {
        if (!videoBlob) {
            alert('Video not recorded. Please try again.');
            return;
        }

        if (!testId) {
            alert('Test ID is missing. Cannot proceed.');
            return;
        }

        // Navigate to the confirmation page
        navigate(`/video-confirmation/${testId}`, {
            state: {
                videoURL: URL.createObjectURL(videoBlob),
                test_id: testId,
            },
        });
    };

    return (
        <div className="video-recording-page-container">
            <div className="video-recording-content">
                <h1 className="video-recording-page-heading">Record Your Non-Fall Video (Full Body!!)</h1>
                <div className="video-recording-alert">
                    You MUST keep your device in a static position and move around to record your non-fall video for the best experience.
                </div>
                <div className="video-recording-button-container">
                    <button
                        className="video-recording-btn video-recording-btn-start"
                        onClick={handleStartRecording}
                        disabled={isStartDisabled}
                    >
                        Start Recording
                    </button>
                    <button
                        className="video-recording-btn video-recording-btn-save"
                        onClick={handleSaveRecording}
                        disabled={isSaveDisabled}
                    >
                        Save Recording
                    </button>
                    {showProceedButton && (
                        <button
                            className="video-recording-btn video-recording-btn-proceed"
                            onClick={handleProceed}
                        >
                            Proceed
                        </button>
                    )}
                </div>
            </div>
            {isRecording && (
                <div className="video-recording-camera-container">
                    <video ref={videoRef} className="video-recording-video" />
                    <canvas ref={canvasRef} className="video-recording-canvas" />
                </div>
            )}
        </div>
    );
};

export default VideoRecordingPage;
