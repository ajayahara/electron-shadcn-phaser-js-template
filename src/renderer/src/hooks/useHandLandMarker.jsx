import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

export const useHandLandMarker = () => {
    const handDetector = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const poseCount = useRef(null);
    const [landmarks, setLandmarks] = useState(null);

    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const startCamera = async () => {
            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = streamRef.current;
                await videoRef.current.play();
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        const createDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks('/wasm');
                const detector = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: '/models/hand_landmarker.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                    numHands: 1 // change the value to 2 for detecting two hands
                });
                handDetector.current = detector;
            } catch (error) {
                console.error("Error creating hand detector:", error);
            }
        };

        const detectHands = async () => {
            if (!handDetector.current) return;
            const ctx = canvasRef.current.getContext('2d');
            const renderHands = async () => {
                if (!handDetector.current) return;
                const results = await handDetector.current.detectForVideo(videoRef.current, Date.now());
                poseCount.current++;
                setLandmarks(results?.landmarks || []);
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                if (results?.landmarks) {
                    results.landmarks.forEach((handLandmarks) => {
                        handLandmarks.forEach((landmark) => {
                            ctx.beginPath();
                            ctx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = 'yellow';
                            ctx.fill();
                        });
                    });
                }
                requestAnimationFrame(renderHands);
            };
            renderHands();
        };

        const initialize = async () => {
            await startCamera();
            await createDetector();
            detectHands();
        };

        initialize();

        return () => {
            if (handDetector.current) {
                handDetector.current.close();
                handDetector.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [videoRef, canvasRef]);
    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("Poses detected in last second:", poseCount.current);
            poseCount.current = 0;
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return { videoRef, canvasRef, landmarks };
};
