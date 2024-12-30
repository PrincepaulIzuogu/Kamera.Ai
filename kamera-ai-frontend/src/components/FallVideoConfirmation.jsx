import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/FallVideoConfirmation.css";

const FallVideoConfirmation = () => {
    const { state } = useLocation(); // Get the video URL and test_id from state
    const { videoURL, test_id } = state || {};

    const videoRef = useRef(null);
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showAlert, setShowAlert] = useState(true);
    const [alertMessage, setAlertMessage] = useState("You MUST play the video to the end!");
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(null);
    const [isTrimmingEnabled, setIsTrimmingEnabled] = useState(false);
    const navigate = useNavigate();

    const handleVideoEnd = () => {
        setShowAlert(true);
        setAlertMessage(
            "To TRIM the video, PLAY and PAUSE the video to the exact point when the fall started and click 'Start Time' button and also PLAY and PAUSE the video to the end when the fall stopped and click 'End Time!'."
        );
        setIsTrimmingEnabled(true); // Enable trimming after video ends
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleTrimStart = () => {
        if (!videoRef.current) return;
        setTrimStart(videoRef.current.currentTime);
    };

    const handleTrimEnd = () => {
        if (!videoRef.current) return;
        setTrimEnd(videoRef.current.currentTime);
        setIsConfirmEnabled(true); // Enable confirm button after trimming
    };

    const handleConfirm = async () => {
        if (!videoURL || !test_id) {
            alert("Missing video or test information.");
            return;
        }

        if (trimStart === null || trimEnd === null || trimStart >= trimEnd) {
            alert("Please ensure valid start and end times are selected for trimming.");
            return;
        }

        try {
            setIsUploading(true);

            // Fetch the video blob from the URL
            const videoBlob = await fetch(videoURL).then((res) => res.blob());

            const formData = new FormData();
            formData.append("test_id", parseInt(test_id, 10));
            formData.append("video", videoBlob, `${test_id}_fall_video_trimmed.webm`);
            formData.append("start_time", parseFloat(trimStart)); // Ensure floats are sent
            formData.append("end_time", parseFloat(trimEnd));

            console.log("FormData contents:");
            formData.forEach((value, key) => console.log(`${key}:`, value));

            const response = await fetch("https://kamera-ai-backend-aacmbegmdjcxfhdq.germanywestcentral-01.azurewebsites.net/upload-fall-video", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const responseData = await response.json();
                navigate(`/create-model/${responseData.test_id}`, {
                    state: { test_id: responseData.test_id },
                });
            } else {
                const errorData = await response.json();
                console.error("Error response from server:", errorData);
                alert(`Failed to upload video: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            alert("An error occurred while uploading the video.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fallvideo-confirmation-page-container">
            <div className="fallconfirmation-box">
                <h1 className="fallvideo-confirmation-heading">Confirm and Trim Your Video</h1>
                {showAlert && <div className="fallvideo-alert">{alertMessage}</div>}
                <div className="fallvideo-container">
                    {videoURL ? (
                        <video
                            ref={videoRef}
                            src={videoURL}
                            controls
                            onEnded={handleVideoEnd}
                            className="fallconfirmation-video"
                        />
                    ) : (
                        <div>No video available to play.</div>
                    )}
                </div>
                <div className="falltrim-controls">
                    <button
                        className="falltrim-button"
                        onClick={handleTrimStart}
                        disabled={!isTrimmingEnabled || isUploading}
                    >
                        Set Start Time
                    </button>
                    <button
                        className="falltrim-button"
                        onClick={handleTrimEnd}
                        disabled={!isTrimmingEnabled || isUploading}
                    >
                        Set End Time
                    </button>
                </div>
                <div className="falltrim-info">
                    <span>Trim Start: {trimStart.toFixed(2)} seconds</span>
                    <span>Trim End: {trimEnd ? `${trimEnd.toFixed(2)} seconds` : "Not set"}</span>
                </div>
                <div className="fallbutton-container">
                    <button
                        className="fallconfirm-button"
                        onClick={handleConfirm}
                        disabled={!isConfirmEnabled || isUploading}
                    >
                        {isUploading ? "Uploading..." : "Confirm and Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FallVideoConfirmation;
