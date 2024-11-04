import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

export const useFaceLandMarker = ({ videoRef, canvasRef }) => {
    const faceDetector = useRef(null);
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
                const vision = await FilesetResolver.forVisionTasks('/wasm');
                const detector = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: '/models/face_landmarker.task',
                        delegate: 'GPU' // Switch to 'CPU' if GPU issues arise
                    },
                    runningMode: 'VIDEO'
                });
                faceDetector.current = detector;
                setLoading(false);
            } catch (error) {
                console.error("Error creating face detector:", error);
            }
        };

        const detectFaces = async () => {
            if (!videoRef.current || !canvasRef.current || !faceDetector.current) return;

            const ctx = canvasRef.current.getContext('2d');

            const renderFaces = async () => {
                if (!faceDetector.current || videoRef.current.readyState < 2) {
                    animationFrameId = requestAnimationFrame(renderFaces);
                    return;
                }

                try {
                    const results = await faceDetector.current.detectForVideo(videoRef.current, Date.now());
                    setLandmarks(results?.landmarks || []);

                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    if (results?.landmarks) {
                        results.landmarks.forEach((faceLandmarks) => {
                            faceLandmarks.forEach((landmark) => {
                                ctx.beginPath();
                                ctx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 3, 0, 2 * Math.PI);
                                ctx.fillStyle = 'red';
                                ctx.fill();
                            });
                        });
                    }
                } catch (error) {
                    console.error("Face detection error:", error);
                }
                animationFrameId = requestAnimationFrame(renderFaces);
            };
            renderFaces();
        };

        const initialize = async () => {
            await startCamera();
            await createDetector();
            detectFaces();
        };

        initialize();

        return () => {
            if (faceDetector.current) {
                faceDetector.current.close();
                faceDetector.current = null;
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [videoRef, canvasRef]);

    return { loading, landmarks };
};
