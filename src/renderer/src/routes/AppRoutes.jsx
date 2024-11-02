import { Routes, Route } from "react-router-dom"
import { TwinklingStars } from "@/pages/game/TwinklingStars"
import { HandDetection } from "@/pages/mediapipe/HandDetection"
import { PoseDetection } from "@/pages/mediapipe/PoseDetection"
import { Home } from "@/pages/Home"
import { CustomDetection } from "@/pages/CustomDetection"
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<CustomDetection />} />
            <Route path="/game/twinkle-stars" element={<TwinklingStars />} />
            <Route path="/mediapipe/hand" element={<HandDetection />} />
            <Route path="/mediapipe/pose" element={<PoseDetection />} />
        </Routes>
    )
}
