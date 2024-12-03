import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import '../styles/VideoRecordingPage.css';
import fallVoice from '../voicevid/fallvoice.mp4';

const FallVideoRecordingPage = () => {
    const { id: testId } = useParams(); // Retrieve the test ID from the URL
    const [isRecording, setIsRecording] = useState(false);
    const [message, setMessage] = useState('');
    const [videoBlob, setVideoBlob] = useState(null);
    const [showProceedButton, setShowProceedButton] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [isStartDisabled, setIsStartDisabled] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioRef = useRef(new Audio(fallVoice));
    const hasPlayedAudio = useRef(false);
    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        console.log(`Navigated with test_id: ${testId}`);
        if (!testId) {
            alert("Test ID is missing. Redirecting...");
            navigate("/"); // Redirect to a suitable page
            return;
        }

        if (!hasPlayedAudio.current) {
            audioRef.current.play();
            hasPlayedAudio.current = true;
        }

        if (isRecording) {
            const videoElement = videoRef.current;
            const canvasElement = canvasRef.current;

            if (!videoElement || !canvasElement) {
                console.error("Video or canvas element is unavailable.");
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
                        chunksRef.current.push(e.data);
                    };

                    mediaRecorderRef.current.onstop = () => {
                        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                        setVideoBlob(blob);
                    };

                    mediaRecorderRef.current.start();

                    await new Promise((resolve) => {
                        videoElement.onloadedmetadata = () => {
                            videoElement.play();
                            canvasElement.width = videoElement.videoWidth;
                            canvasElement.height = videoElement.videoHeight;
                            resolve();
                        };
                    });
                } catch (error) {
                    console.error("Error accessing the webcam:", error);
                    alert('Camera access failed. Please check your permissions.');
                }
            };

            getWebcamStream();

            pose.onResults((results) => {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

                if (results.poseLandmarks) {
                    results.poseLandmarks.forEach((landmark) => {
                        ctx.beginPath();
                        ctx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
                        ctx.fillStyle = 'red';
                        ctx.fill();
                    });

                    POSE_CONNECTIONS.forEach(([from, to]) => {
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
                    });
                }
            });

            return () => {
                if (videoElement.srcObject) {
                    videoElement.srcObject.getTracks().forEach((track) => track.stop());
                }
                pose.close();
            };
        }
    }, [isRecording, testId]);

    const handleStartRecording = () => {
        setIsRecording(true);
        setMessage('Recording started... Please follow the instructions.');
        setIsStartDisabled(true);
        setTimeout(() => setIsSaveDisabled(false), 2000);
    };

    const handleSaveRecording = () => {
        if (!mediaRecorderRef.current) return;

        setIsRecording(false);
        setMessage('Recording stopped.');
        mediaRecorderRef.current.stop();
        setShowProceedButton(true);
        setIsSaveDisabled(true);
    };

    const handleProceed = () => {
        if (!videoBlob) {
            alert('No video recorded. Please try again.');
            return;
        }

        console.log(`Proceeding with test_id: ${testId}`);
        navigate(`/fall-video-confirmation/${testId}`, {
            state: {
                videoURL: URL.createObjectURL(videoBlob),
                test_id: testId,
            },
        });
    };

    return (
        <div className="video-recording-page-container">
            <div className="video-recording-content">
                <h1 className="video-recording-page-heading">Record Your Fall Video (Full Body!!)</h1>
                <div className="video-recording-alert">
                you must keep your device in a static position and record your fall video just the same way you will be falling during your testing for the best experience.
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

export default FallVideoRecordingPage;
