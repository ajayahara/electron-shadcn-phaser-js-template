import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

export const usePoseLandMarker = () => {
    const poseDetector = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const poseCount = useRef(0);
    const [landmarks, setLandmarks] = useState(null);
    const timestampRef=useRef(-1);

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
                const detector = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: '/models/pose_landmarker_lite.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO'
                });
                poseDetector.current = detector;
            } catch (error) {
                console.error("Error creating pose detector:", error);
            }
        };

        const detectPoses = async () => {
            if (!poseDetector.current) return;
            const ctx = canvasRef.current.getContext('2d');
            const renderPoses = async () => {
                if (!poseDetector.current) return;
                poseCount.current++;
                timestampRef.current++;
                const results = await poseDetector.current.detectForVideo(videoRef.current, timestampRef.current);
                setLandmarks(results?.landmarks || []);
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (results?.landmarks) {
                    results.landmarks.forEach((poseLandmarks) => {
                        poseLandmarks.forEach((landmark) => {
                            ctx.beginPath();
                            ctx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = 'yellow';
                            ctx.fill();
                        });
                    });
                }
                requestAnimationFrame(renderPoses);
            };
            renderPoses();
        };

        const initialize = async () => {
            await startCamera();
            await createDetector();
            detectPoses();
        };

        initialize();

        return () => {
            if (poseDetector.current) {
                poseDetector.current.close();
                poseDetector.current = null;
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
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
