import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CreateModel.css";

const CreateModel = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [stage, setStage] = useState("initial");
    const [loadingText, setLoadingText] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCreateModel = async () => {
        console.log("Initiating model creation process...");
        console.log("Test ID received from URL parameters:", testId);

        setStage("loading");
        setLoadingText("Loading personalized videos..."); // Initial loading message
        setErrorMessage(null); // Clear any previous errors

        let stages = ["Video Analysis", "Angle Calculation", "Model Training"];

        try {
            // Log the data being sent to the backend
            const requestBody = { test_id: parseInt(testId, 10) };
            console.log("Request body being sent to backend:", requestBody);

            // Make the API call
            const response = await fetch("http://localhost:5001/create-model", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            console.log("Backend response status:", response.status);

            // Check if response is not OK
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response received from backend:", errorData);
                throw new Error(errorData.detail?.msg || "An unknown error occurred.");
            }

            console.log("Backend response received successfully. Proceeding with animations...");

            // Simulate animations for different stages
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Pause for "Loading personalized videos"
            for (let i = 0; i < stages.length; i++) {
                console.log(`Loading stage: ${stages[i]}`);
                setLoadingText(stages[i]);
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            console.log("Model creation completed successfully. Transitioning to completion stage...");
            setTimeout(() => setStage("complete"), 3000);
        } catch (error) {
            console.error("Error during model creation:", error.message);
            setErrorMessage(error.message);
            setStage("initial"); // Reset to initial state on failure
        }
    };

    const handleTryModel = () => {
        console.log("Navigating to PersonalisedFallDetectionPage with Test ID:", testId);
        navigate(`/personalised-fall-detection/${testId}`, { state: { testId } });
    };

    return (
        <div className="create-model-container">
            {stage === "initial" && (
                <>
                    <h1 className="create-model-title">
                        You are about to create your personalized fall detection model!
                    </h1>
                    <button className="bouncing-button" onClick={handleCreateModel}>
                        Create Model
                    </button>
                    {errorMessage && (
                        <div className="error-message">
                            <p>{errorMessage}</p>
                        </div>
                    )}
                </>
            )}
            {stage === "loading" && (
                <div className="loading-container">
                    <div className="loading-circle"></div>
                    <p className="loading-text">{loadingText}</p>
                </div>
            )}
            {stage === "complete" && (
                <div className="completion-container">
                    <h1 className="completion-message">Congratulations!</h1>
                    <p>Your personalized fall detection model has been created successfully.</p>
                    <button className="try-model-button" onClick={handleTryModel}>
                        Try out your Fall Detection Model
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreateModel;
