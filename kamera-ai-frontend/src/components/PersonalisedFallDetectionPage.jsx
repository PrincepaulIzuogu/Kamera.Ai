import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import * as mpPose from '@mediapipe/pose'; // Import the entire module
import "../styles/PersonalisedFallDetection.css";

const PersonalisedFallDetection = () => {
    const { testId } = useParams();
    const [message, setMessage] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const navigate = useNavigate();

    // Function to handle data deletion
    const deleteData = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete all your data?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5001/delete-data/${testId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                alert("All your data has been deleted successfully.");
                navigate("/"); // Redirect to the homepage
            } else {
                alert("Failed to delete your data. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting data:", error);
            alert("An error occurred while deleting your data.");
        }
    };

    useEffect(() => {
        const setupWebSocket = () => {
            const wsUrl = `ws://localhost:5001/ws/personalised-fall-model/${testId}`;
            console.log(`Connecting to WebSocket at ${wsUrl}`);
            socketRef.current = new WebSocket(wsUrl);

            socketRef.current.onopen = () => {
                console.log("WebSocket connected");
            };

            socketRef.current.onmessage = (event) => {
                console.log("Message received:", event.data);
                setMessage(event.data);
            };

            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socketRef.current.onclose = () => {
                console.log("WebSocket connection closed, reconnecting...");
                setTimeout(setupWebSocket, 5000);
            };
        };

        setupWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [testId]);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const ctx = canvasElement.getContext('2d');

        const pose = new mpPose.Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`, // Use Mediapipe's CDN
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

                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = () => {
                        videoElement.play();
                        resolve();
                    };
                });
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        const sendFrameToBackend = (canvas) => {
            try {
                const frame = canvas.toDataURL('image/jpeg');
                const base64String = frame.split(',')[1];
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                    socketRef.current.send(base64String);
                }
            } catch (error) {
                console.error("Error sending frame to backend:", error);
            }
        };

        let frameCounter = 0;

        const detectPose = async () => {
            try {
                if (videoElement) {
                    await pose.send({ image: videoElement });
                    frameCounter++;
                    if (frameCounter % 10 === 0) {
                        sendFrameToBackend(canvasElement);
                    }
                }
            } catch (error) {
                console.error("Error in pose detection:", error);
            }
        };

        const processVideo = async () => {
            await detectPose();
            requestAnimationFrame(processVideo);
        };

        getWebcamStream().then(() => {
            videoElement.addEventListener('loadeddata', () => {
                processVideo();
            });
        });

        pose.onResults((results) => {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            if (results.poseLandmarks) {
                results.poseLandmarks.forEach((landmark) => {
                    ctx.beginPath();
                    ctx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
                    ctx.fill();
                });

                for (const connection of mpPose.POSE_CONNECTIONS) {
                    const from = results.poseLandmarks[connection[0]];
                    const to = results.poseLandmarks[connection[1]];
                    ctx.beginPath();
                    ctx.moveTo(from.x * canvasElement.width, from.y * canvasElement.height);
                    ctx.lineTo(to.x * canvasElement.width, to.y * canvasElement.height);
                    ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
                    ctx.lineWidth = 3;
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
    }, [testId]);

    return (
        <div className="fall-detection-container">
            <button className="delete-data-button" onClick={deleteData}>
                Delete Your Data
            </button>
            <h1 className="fall-detection-title">Personalized Fall Detection for Test ID: {testId}</h1>
            <div className="video-container">
                <video ref={videoRef} style={{ display: 'none' }} />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="video-canvas"
                />
            </div>
            <h2 className="detection-message">{message}</h2>
        </div>
    );
};

export default PersonalisedFallDetection;
