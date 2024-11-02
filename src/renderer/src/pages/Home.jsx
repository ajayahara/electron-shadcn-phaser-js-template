import { NavLink } from 'react-router-dom'
export const Home = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-white">
      <h1>Welcome to the Home Page</h1>
      <p>This is where you will find the main functionality of the application.</p>
      <div className="flex gap-3">
        <NavLink to="/game/twinkle-stars" className='underline text-purple-800' >Start game</NavLink>
        <NavLink to="/mediapipe/hand" className='underline text-purple-800' >Start Hand Detection</NavLink>
        <NavLink to="/mediapipe/pose" className='underline text-purple-800' >Start Pose Detection</NavLink>
      </div>
    </div>
  )
}
