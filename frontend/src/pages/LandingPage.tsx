// import { useState, useEffect } from 'react';
// import { TypeAnimation } from 'react-type-animation';
import Gradient from '../components/Gradient';

const LandingPage = () => {
    <>
        {/* Render Gradient in background */}
        <Gradient />
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-6xl font-bold text-white">Welcome to the Landing Page</h1>
        </div> 
    </>
}

export default LandingPage