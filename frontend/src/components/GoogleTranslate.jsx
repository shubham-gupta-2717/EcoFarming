import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const GoogleTranslate = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if script is already added
        if (!document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) {
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,mr,pa,gu,ta,te,kn,ml,bn,ur',
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            };
        }

        // Observer to detect when Google renders the button
        const observer = new MutationObserver((mutations) => {
            const widget = document.querySelector('.goog-te-gadget-simple');
            if (widget) {
                setIsLoaded(true);
                // We don't disconnect immediately to handle re-renders or language changes if needed, 
                // but for just loading state, disconnecting is fine once found.
                // However, Google sometimes re-renders it. Let's keep it simple.
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="google-translate-container relative min-w-[160px] min-h-[40px]">
            {/* Skeleton / Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-between bg-eco-50 border border-eco-200 rounded-full px-4 py-2 cursor-wait z-10 box-border h-full w-full">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-eco-700 animate-pulse" />
                        <span className="text-sm font-semibold text-eco-700">Loading...</span>
                    </div>
                </div>
            )}

            {/* Actual Widget */}
            <div id="google_translate_element" className={!isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-300'}></div>

            <style>{`
                .google-translate-container {
                    display: inline-block;
                    vertical-align: middle;
                }
                /* Hide the Google Translate top banner */
                body {
                    top: 0 !important;
                }
                .goog-te-banner-frame {
                    display: none !important;
                }
                
                /* Customize the dropdown container */
                .goog-te-gadget-simple {
                    background-color: #ecfdf5 !important; /* eco-50 */
                    border: 1px solid #a7f3d0 !important; /* eco-200 */
                    padding: 8px 16px !important;
                    border-radius: 9999px !important; /* rounded-full */
                    font-size: 14px !important;
                    line-height: 20px !important;
                    display: flex !important;
                    align-items: center !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    color: #047857 !important; /* eco-700 */
                    font-weight: 600 !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                    min-height: 40px !important; /* Match skeleton height */
                    box-sizing: border-box !important;
                }
                
                .goog-te-gadget-simple:hover {
                    background-color: #d1fae5 !important; /* eco-100 */
                    border-color: #34d399 !important; /* eco-400 */
                }

                /* Hide Google logo */
                .goog-te-gadget-simple img {
                    display: none !important;
                }

                /* Style the text */
                .goog-te-gadget-simple span {
                    color: #047857 !important; /* eco-700 */
                    font-weight: 600 !important;
                }

                /* Style the arrow (it's usually an image or character in a span) */
                .goog-te-gadget-simple .goog-te-menu-value span:last-child {
                    border-left: none !important;
                    padding-left: 8px !important;
                    color: #047857 !important;
                    opacity: 0.7;
                }

                /* Hide the "Powered by Google" text */
                .goog-te-gadget {
                    color: transparent !important;
                    font-size: 0 !important;
                }
                .goog-te-gadget > span > a {
                    display: none !important;
                }
                
                /* Hide tooltips */
                .goog-tooltip {
                    display: none !important;
                }
                .goog-tooltip:hover {
                    display: none !important;
                }
                .goog-text-highlight {
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
            `}</style>
        </div>
    );
};

export default GoogleTranslate;
