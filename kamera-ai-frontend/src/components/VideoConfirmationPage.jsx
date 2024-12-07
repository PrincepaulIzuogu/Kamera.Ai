import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/VideoConfirmationPage.css';

const VideoConfirmationPage = () => {
    const { state } = useLocation(); // Get the video URL and test_id from state
    const { videoURL, test_id } = state || {};

    console.log("Received state:", state);
    console.log("Video URL:", videoURL);
    console.log("Test ID:", test_id);

    const videoRef = useRef(null);
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false); // Enable Confirm button after video playback
    const [isUploading, setIsUploading] = useState(false); // Show loading state during upload
    const [showAlert, setShowAlert] = useState(true); // Show the alert initially
    const navigate = useNavigate();

    const handleVideoEnd = () => {
        setIsConfirmEnabled(true); // Enable Confirm button after video ends
        setShowAlert(false); // Hide the alert after video is played
    };

    const handleConfirm = async () => {
        if (!videoURL || !test_id) {
            alert('Missing video or test information.');
            return;
        }

        try {
            setIsUploading(true); // Show loading state

            // Fetch the Blob from the video URL
            const videoBlob = await fetch(videoURL).then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch video blob.");
                }
                return res.blob();
            });

            // Prepare FormData for the backend
            const formData = new FormData();
            formData.append('test_id', parseInt(test_id, 10)); // Ensure test_id is an integer
            formData.append('video', videoBlob, `${test_id}_nonfall_video.webm`); // Add video file

            console.log("FormData contents:");
            formData.forEach((value, key) => console.log(`${key}:`, value));

            // Send video and test_id to the backend
            const response = await fetch('http://localhost:5001/upload-video', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log("Upload response data:", responseData);

                // Navigate to fall video recording with the returned test_id
                navigate(`/video-recording/fall/${responseData.test_id}`, {
                    state: { test_id: responseData.test_id },
                });
            } else {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                alert(`Failed to upload video: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('An error occurred while uploading the video.');
        } finally {
            setIsUploading(false); // Hide loading state
        }
    };

    return (
        <div className="video-confirmation-page-container">
            <div className="confirmation-box">
                <h1 className="video-confirmation-heading">Confirm Your Video</h1>
                {showAlert && (
                    <div className="video-alert">
                        You must play the video to the end before confirming!
                    </div>
                )}
                <div className="video-container">
                    {videoURL ? (
                        <video
                            ref={videoRef}
                            src={videoURL}
                            controls
                            onEnded={handleVideoEnd}
                            className="confirmation-video"
                        />
                    ) : (
                        <div>No video available to play.</div>
                    )}
                </div>
                <div className="button-container">
                    <button
                        className="confirm-button"
                        onClick={handleConfirm}
                        disabled={!isConfirmEnabled || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Confirm and Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoConfirmationPage;
