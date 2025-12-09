import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square, Gauge, Play, Pause, Languages } from 'lucide-react';

const TextToSpeech = ({ textEn, textHi, layout = 'button' }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);
    const [rate, setRate] = useState(0.85); // Default: Normal
    const [language, setLanguage] = useState('en'); // 'en' | 'hi'
    const [availableVoices, setAvailableVoices] = useState([]);
    const utteranceRef = useRef(null);

    // Initialize Speech Synthesis and load voices
    useEffect(() => {
        if (!window.speechSynthesis) {
            setSupported(false);
            return;
        }

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setAvailableVoices(voices);
            }
        };

        // Voices might load asynchronously
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Cleanup
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const getVoiceForLanguage = (langCode) => {
        // Try to find an exact match for the region (e.g., hi-IN)
        const exactMatch = availableVoices.find(v => v.lang === (langCode === 'hi' ? 'hi-IN' : 'en-IN'));
        if (exactMatch) return exactMatch;

        // Fallback to any voice of that language
        const generalMatch = availableVoices.find(v => v.lang.startsWith(langCode));
        if (generalMatch) return generalMatch;

        // Ultimate fallback: First available voice (or null to let browser decide)
        return null;
    };

    const speak = () => {
        if (!supported) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        // Determine text to speak
        let textTospeak = language === 'hi' ? (textHi || textEn) : textEn;

        if (!textTospeak) {
            console.warn("No text available to speak.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(textTospeak);
        utteranceRef.current = utterance;

        // Configure Utterance
        utterance.rate = rate;
        utterance.pitch = 1;

        // Voice Selection
        const targetLang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.lang = targetLang;

        const selectedVoice = getVoiceForLanguage(language);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        // Event Handlers
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech Error:", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const toggleSpeed = (e) => {
        e.stopPropagation();
        // Cycle: 0.85 (Normal) -> 0.7 (Slow) -> 1.0 (Fast) -> 0.85
        const newRate = rate === 0.85 ? 0.7 : rate === 0.7 ? 1.0 : 0.85;
        setRate(newRate);

        // Restart if currently speaking
        if (isSpeaking) {
            stop();
            setTimeout(speak, 50);
        }
    };

    const toggleLanguage = (e) => {
        e.stopPropagation();
        const newLang = language === 'en' ? 'hi' : 'en';
        setLanguage(newLang);

        // Restart if currently speaking
        if (isSpeaking) {
            stop();
            // Small delay to allow state update
            setTimeout(() => {
                // We can't call speak() immediately because state updates are async
                // effectively we stop, user has to play again or we use a ref for lang
                // for simplicity, let's just stop. The user sees the toggle change.
            }, 50);
        }
    };

    // Auto-restart speech when language changes if it was already playing?
    // User requirement: "Cancels any previous speech before starting new speech"
    // Let's keep it simple: Changing settings stops audio. User clicks play again.

    // Label Helpers
    const getSpeedLabel = () => {
        if (rate === 0.7) return 'Slow';
        if (rate === 1.0) return 'Fast';
        return 'Normal';
    };

    if (!supported) return null;

    // --- CARD LAYOUT (Mission Detail) ---
    if (layout === 'card') {
        return (
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-600 flex-shrink-0">
                        <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">
                            {language === 'hi' ? 'निर्देश सुनें' : 'Listen to Instructions'}
                        </p>
                        <p className="text-xs text-eco-600">
                            {isSpeaking ? (language === 'hi' ? 'बोल रहा है...' : 'Speaking...') : (language === 'hi' ? 'सुनने के लिए प्ले दबाएं' : 'Tap Play to listen')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Play/Stop Main Button */}
                    <button
                        onClick={isSpeaking ? stop : speak}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${isSpeaking
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-eco-600 text-white hover:bg-eco-700'
                            }`}
                    >
                        {isSpeaking ? (
                            <> <Pause className="w-4 h-4" /> Stop </>
                        ) : (
                            <> <Play className="w-4 h-4" /> Play </>
                        )}
                    </button>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium flex items-center gap-1 transition"
                    >
                        <Languages className="w-4 h-4" />
                        {language === 'en' ? 'English' : 'हिंदी'}
                    </button>

                    {/* Speed Toggle */}
                    <button
                        onClick={toggleSpeed}
                        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium flex items-center gap-1 transition"
                    >
                        <Gauge className="w-4 h-4" />
                        {getSpeedLabel()}
                    </button>
                </div>

                {/* Fallback Warning if Hindi text missing while Hindi selected */}
                {language === 'hi' && !textHi && (
                    <p className="text-[10px] text-orange-500 mt-2 text-center">
                        * हिंदी उपलब्ध नहीं है, अंग्रेजी का उपयोग किया जा रहा है।
                    </p>
                )}
            </div>
        );
    }

    // --- BUTTON LAYOUT (Compact) ---
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                isSpeaking ? stop() : speak();
            }}
            className={`p-2 rounded-full transition-colors flex items-center gap-2 relative group ${isSpeaking
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-eco-100 text-eco-700 hover:bg-eco-200'
                }`}
            title={isSpeaking ? "Stop" : "Listen"}
        >
            {isSpeaking ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}

            {/* Simple tooltip or label if needed */}
        </button>
    );
};

export default TextToSpeech;
