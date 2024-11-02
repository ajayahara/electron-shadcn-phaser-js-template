import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useCamera, useMediapipe , useHandLandmarker} from "use-media-models";

export const HandDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseCount = useRef(0);
    const { startCamera, stopCamera} = useCamera(videoRef);
    const { startModel, stopModel } = useMediapipe("handLandmarker", {
        onResults: (results) => {
            if (!canvasRef.current && !videoRef.current) return;
            poseCount.current++;
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext("2d");
            canvas.width = video.offsetWidth;
            canvas.height = video.offsetHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawLandmarks(canvas, ctx, results.landmarks[0]);
            drawLandmarks(canvas, ctx, results.landmarks[1]);
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
        // Log the pose count every second and reset
        const intervalId = setInterval(() => {
            console.log("Poses detected in last second:", poseCount.current);
            poseCount.current = 0;
        }, 1000);

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);

    const drawLandmarks = (canvas, ctx, landmarks) => {
        if (!landmarks) return;
        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI); // Slightly larger circles
            ctx.fillStyle = 'blue' // Thumb red, others blue
            ctx.fill();
        });
    };

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