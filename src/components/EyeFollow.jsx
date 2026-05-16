"use client";

import { useEffect, useRef } from "react";

export default function EyeFollow() {
    const eyeRef = useRef(null);
    const pupilRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const eye = eyeRef.current;
            const pupil = pupilRef.current;
            if (!eye || !pupil) return;

            const rect = eye.getBoundingClientRect();

            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const angle = Math.atan2(
                e.clientY - eyeCenterY,
                e.clientX - eyeCenterX
            );

            const maxMove = 10;

            const x = Math.cos(angle) * maxMove;
            const y = Math.sin(angle) * maxMove;

            pupil.style.transform = `translate(${x}px, ${y}px)`;
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={eyeRef}
            className="w-32 h-32 md:w-64 md:h-64 rounded-full border-2 border-red-500/50 flex items-center justify-center bg-red-500/10 relative shadow-[0_0_50px_rgba(255,0,0,0.2)]"
        >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div
                    ref={pupilRef}
                    className="w-6 h-6 bg-black rounded-full transition-transform duration-75 ease-out"
                />
            </div>
        </div>
    );
}