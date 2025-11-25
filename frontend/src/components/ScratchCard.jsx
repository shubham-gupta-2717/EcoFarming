import React, { useRef, useEffect, useState } from 'react';

const ScratchCard = ({ children, coverColor = '#CCCCCC', onReveal, isRevealed: externalIsRevealed }) => {
    const canvasRef = useRef(null);
    const [internalIsRevealed, setInternalIsRevealed] = useState(false);

    const isRevealed = externalIsRevealed !== undefined ? externalIsRevealed : internalIsRevealed;

    const [isScratching, setIsScratching] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;

        const initCanvas = () => {
            const { width, height } = container.getBoundingClientRect();

            // Only update if dimensions changed to avoid resetting
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;

                // Fill with cover color
                ctx.fillStyle = coverColor;
                ctx.fillRect(0, 0, width, height);

                // Add "Scratch Here" text
                ctx.fillStyle = '#666666';
                ctx.font = 'bold 10px sans-serif'; // Smaller font for small cards
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Scratch', width / 2, height / 2);
            }
        };

        // Initial setup
        initCanvas();

        // Handle resizing
        const resizeObserver = new ResizeObserver(() => {
            initCanvas();
        });
        resizeObserver.observe(container);

        return () => resizeObserver.disconnect();
    }, [coverColor]);

    const scratch = (x, y) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // Adjust for canvas scaling
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const scratchX = x * scaleX;
        const scratchY = y * scaleY;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(scratchX, scratchY, 12, 0, Math.PI * 2); // Slightly smaller brush for small cards
        ctx.fill();

        checkReveal();
    };

    const checkReveal = () => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            // Check for semi-transparency (alpha < 128)
            if (pixels[i] < 128) transparentPixels++;
        }

        const percentRevealed = (transparentPixels / (pixels.length / 4)) * 100;

        if (percentRevealed > 20) { // Lower threshold to 20%
            setInternalIsRevealed(true);
            if (onReveal) onReveal();
            // Clear entire canvas
            ctx.clearRect(0, 0, width, height);
        }
    };

    const handleMouseDown = (e) => {
        setIsScratching(true);
        const rect = canvasRef.current.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseMove = (e) => {
        if (!isScratching) return;
        const rect = canvasRef.current.getBoundingClientRect();
        scratch(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseUp = () => {
        setIsScratching(false);
    };

    return (
        <div className="relative w-full h-full overflow-hidden rounded-lg select-none">
            <div className={`absolute inset-0 flex items-center justify-center bg-white ${isRevealed ? 'z-20' : 'z-0'}`}>
                {children}
            </div>
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 z-10 cursor-pointer touch-none transition-opacity duration-500 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                    setIsScratching(true);
                    const rect = canvasRef.current.getBoundingClientRect();
                    const touch = e.touches[0];
                    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
                }}
                onTouchMove={(e) => {
                    if (!isScratching) return;
                    e.preventDefault(); // Prevent scrolling while scratching
                    const rect = canvasRef.current.getBoundingClientRect();
                    const touch = e.touches[0];
                    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
                }}
                onTouchEnd={handleMouseUp}
            />
        </div>
    );
};

export default ScratchCard;
