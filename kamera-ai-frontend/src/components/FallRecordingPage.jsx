import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';

const FallRecordingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

    const handleStartRecording = () => {
        setIsRecording(true);
        setMessage('Recording started... Please follow the instructions.');
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        setMessage('Recording stopped.');
    };

    const handleFinishRecording = () => {
        setMessage('Finishing recording...');
        setTimeout(() => {
            navigate('/crop-video'); // Navigate to crop video page after finishing recording
        }, 2000);
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div className="left" style={{ width: '50%', padding: '20px' }}>
                <h2>Record your Fall Video</h2>
                <div className="alert alert-danger" style={{ animation: 'bounce 1s infinite' }}>
                    You MUST keep your device in a static position and record your one-time fall video just same way you would fall during testing for the best experience!!! After recording, click finish.
                </div>
                <div>
                    <button className="btn btn-success" onClick={handleStartRecording}>Start Recording</button>
                    <button className="btn btn-warning" onClick={handleStopRecording}>Stop Recording</button>
                    <button className="btn btn-danger" onClick={handleFinishRecording}>Finish Recording</button>
                </div>
            </div>
            <div className="right" style={{ width: '50%', padding: '20px' }}>
                <canvas ref={canvasRef} width={640} height={480} style={{ border: '1px solid black' }} />
                <video ref={videoRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
};

export default FallRecordingPage;
