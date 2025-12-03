import React, { useState, useEffect } from 'react';
import { Volume2, Square, Gauge, Play, Pause } from 'lucide-react';

const TextToSpeech = ({ text, layout = 'button' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [rate, setRate] = useState(0.85); // Default to slightly slower

    useEffect(() => {
        if (!window.speechSynthesis) {
            setSupported(false);
        }
    }, []);

    const speak = () => {
        if (!supported) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = rate;
        utterance.pitch = 1;

        // Attempt to detect language
        let lang = 'en-IN';
        const htmlLang = document.documentElement.lang;
        if (htmlLang && htmlLang !== 'en') {
            lang = htmlLang;
        }
        utterance.lang = lang;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const toggleSpeed = (e) => {
        e.stopPropagation();
        // Cycle speeds: 0.85 (Normal-ish) -> 0.7 (Slow) -> 1.0 (Fast)
        const newRate = rate === 0.85 ? 0.7 : rate === 0.7 ? 1.0 : 0.85;
        setRate(newRate);

        // If speaking, restart with new rate
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setTimeout(speak, 100);
        }
    };

    const getSpeedLabel = () => {
        if (rate === 0.7) return 'Slow';
        if (rate === 1.0) return 'Fast';
        return 'Normal';
    };

    if (!supported) return null;

    if (layout === 'card') {
        return (
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-eco-100 rounded-full flex items-center justify-center text-eco-600 flex-shrink-0">
                    <Volume2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Listen to Instructions</p>
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            onClick={toggleSpeed}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            title="Change Speed"
                        >
                            <Gauge className="w-3 h-3" />
                            {getSpeedLabel()}
                        </button>
                    </div>
                </div>
                <button
                    onClick={isSpeaking ? stop : speak}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${isSpeaking
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-eco-600 text-white hover:bg-eco-700'
                        }`}
                >
                    {isSpeaking ? (
                        <span key="stop-btn" className="flex items-center gap-2">
                            <Pause className="w-4 h-4" /> <span>Stop</span>
                        </span>
                    ) : (
                        <span key="play-btn" className="flex items-center gap-2">
                            <Play className="w-4 h-4" /> <span>Play</span>
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                isSpeaking ? stop() : speak();
            }}
            className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isSpeaking
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-eco-100 text-eco-700 hover:bg-eco-200'
                }`}
            title={isSpeaking ? "Stop Audio" : "Play Audio Instructions"}
        >
            {isSpeaking ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
            <span className="text-sm font-medium hidden md:inline">
                {isSpeaking ? <span key="stop-text">Stop</span> : <span key="listen-text">Listen</span>}
            </span>
        </button>
    );
};

export default TextToSpeech;
