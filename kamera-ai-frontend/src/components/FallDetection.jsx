import React, { useEffect, useState, useRef } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';

const FallDetection = () => {
    const [message, setMessage] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const setupWebSocket = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const socketUrl = `${protocol}//backend:5001/ws`;
            socketRef.current = new WebSocket(socketUrl);

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
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
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
                socketRef.current.send(base64String);
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
            setTimeout(() => {
                requestAnimationFrame(processVideo);
            }, 100); // Process frames every 100ms
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
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Kamera.Ai Fall Detection</h1>
            <video ref={videoRef} style={{ display: 'none' }} />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{ border: '1px solid black' }}
            />
            <h2>{message}</h2>
        </div>
    );
};

export default FallDetection;
