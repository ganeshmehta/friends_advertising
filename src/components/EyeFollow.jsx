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
            className="w-32 h-32 md:w-64 md:h-64 rounded-full border border-slate-200 flex items-center justify-center bg-slate-100/40 relative shadow-inner"
        >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                <div
                    ref={pupilRef}
                    className="w-8 h-8 bg-black rounded-full transition-transform duration-75 ease-out"
                />
            </div>
        </div>
    );
}