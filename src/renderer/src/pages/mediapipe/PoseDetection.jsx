import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useCamera, useMediapipe } from "use-media-models";

export const PoseDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseCount = useRef(0);
    const { startCamera, stopCamera } = useCamera(videoRef);
    const { startModel, stopModel} = useMediapipe("poseLandmarker", {
        onResults: (results) => {
            if (canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const ctx = canvas.getContext("2d");
                canvas.width = video.offsetWidth;
                canvas.height = video.offsetHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Flip the canvas horizontally for mirror effect
                ctx.save();
                // ctx.scale(-1, 1);
                // ctx.translate(-canvas.width, 0);

                if (results.landmarks && results.landmarks[0]) {
                    poseCount.current++;

                    // Draw skeleton lines between key landmarks
                    const connections = [
                        [11, 13], [13, 15], // Left arm
                        [12, 14], [14, 16], // Right arm
                        [11, 12], // Shoulders
                        [11, 23], [12, 24], // Torso
                        [23, 24], // Hips
                        [23, 25], [25, 27], // Left leg
                        [24, 26], [26, 28], // Right leg
                    ];

                    ctx.strokeStyle = "blue";
                    ctx.lineWidth = 2;

                    connections.forEach(([start, end]) => {
                        const startLandmark = results.landmarks[0][start];
                        const endLandmark = results.landmarks[0][end];

                        ctx.beginPath();
                        ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
                        ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
                        ctx.stroke();
                    });

                    // Draw landmarks as circles
                    results.landmarks[0].forEach((landmark) => {
                        ctx.beginPath();
                        ctx.arc(
                            landmark.x * canvas.width,
                            landmark.y * canvas.height,
                            5,
                            0,
                            2 * Math.PI
                        );
                        ctx.fillStyle = "red";
                        ctx.fill();
                    });
                }

                ctx.restore();
            }
        },
    });

    useEffect(() => {
        startCamera().then(({ stream }) => startModel({ stream }));

        const resizeCanvas = () => {
            if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.offsetWidth;
                canvasRef.current.height = videoRef.current.offsetHeight;
            }
        };

        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            stopModel();
            stopCamera();
            videoRef.current=null;
            canvasRef.current=null;
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log("Poses detected in last second:", poseCount.current);
            poseCount.current = 0;
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <>
            <div className="h-1/2 aspect-video relative">
                <video
                    ref={videoRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        backgroundColor: "white",
                    }}
                    autoPlay
                    playsInline
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
            <NavLink to="/" className='underline text-purple-800'>Go Back</NavLink>
        </>
    );
}
