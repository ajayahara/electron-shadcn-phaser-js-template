import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

export const usePoseLandMarker = ({ videoRef, canvasRef }) => {
    const poseDetector = useRef(null);
    const poseCount = useRef(0);
    const timeStampRef = useRef(-1);
    const [loading, setLoading] = useState(true);
    const [landmarks, setLandmarks] = useState(null);
    let animationFrameId = null;

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
            }
        };

        const createDetector = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm');
                const detector = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: '/models/pose_landmarker_full.task',
                        delegate: 'GPU'
                    },
                    runningMode: 'VIDEO'
                });
                poseDetector.current = detector;
                setLoading(false);
            } catch (error) {
                console.error("Error creating pose detector:", error);
            }
        };

        const detectPoses = async () => {
            if (!videoRef.current || !canvasRef.current || !poseDetector.current) return;

            const ctx = canvasRef.current.getContext('2d');

            const renderPoses = async () => {
                if (!poseDetector.current || videoRef.current.readyState < 2) {
                    animationFrameId = requestAnimationFrame(renderPoses);
                    return;
                }
                timeStampRef.current++;
                poseCount.current++;
                const results = await poseDetector.current.detectForVideo(videoRef.current, timeStampRef.current);
                setLandmarks(results?.landmarks || []);

                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (results?.landmarks) {
                    results.landmarks.forEach((poseLandmarks) => {
                        poseLandmarks.forEach((landmark) => {
                            ctx.beginPath();
                            ctx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = 'blue';
                            ctx.fill();
                        });
                    });
                }
                animationFrameId = requestAnimationFrame(renderPoses);
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
    return { loading, landmarks };
};
