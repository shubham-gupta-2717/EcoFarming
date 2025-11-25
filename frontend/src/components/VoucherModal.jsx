import React, { useState } from 'react';
import { X, Ticket, RefreshCw } from 'lucide-react';
import ScratchCard from './ScratchCard';

const VoucherModal = ({ voucher, onClose }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [key, setKey] = useState(0);
    const [copied, setCopied] = useState(false);
    const codeToDisplay = voucher.couponCode || 'SAVE-2024-NOW';

    if (!voucher) return null;

    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(codeToDisplay);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-emerald-50 p-4 flex justify-between items-center border-b border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-800">
                        <Ticket className="w-5 h-5" />
                        <h3 className="font-bold">Scratch & Win</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">{voucher.name}</h2>
                        <p className="text-gray-500 text-sm">Scratch the card below to reveal your coupon code!</p>
                    </div>

                    {/* Scratch Area */}
                    <div className="relative w-full aspect-[3/2] bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
                        <ScratchCard
                            key={key}
                            coverColor="#e5e7eb"
                            isRevealed={isRevealed}
                            onReveal={() => setIsRevealed(true)}
                        >
                            <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">Your Coupon Code</span>
                                <button
                                    onClick={handleCopy}
                                    className="bg-white px-4 py-2 rounded-lg border-2 border-dashed border-emerald-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer active:scale-95"
                                    title="Click to copy"
                                >
                                    <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest select-all">
                                        {codeToDisplay}
                                    </span>
                                </button>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {copied ? <span className="text-emerald-600 font-bold">Copied!</span> : 'Click code to copy'}
                                </p>
                            </div>
                        </ScratchCard>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!isRevealed ? (
                            <button
                                onClick={handleReveal}
                                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                            >
                                Reveal Code Instantly
                            </button>
                        ) : (
                            <button
                                onClick={handleCopy}
                                className={`flex-1 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center justify-center gap-2 ${copied
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <RefreshCw className="w-4 h-4" /> Copied!
                                    </>
                                ) : (
                                    'Copy Code'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-gray-400 font-medium mb-0.5">Valid At</span>
                                <span className="text-gray-800 font-bold">{voucher.validAt}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 font-medium mb-0.5">Valid For</span>
                                <span className="text-gray-800 font-bold">{voucher.validityDays} Days</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-gray-400 font-medium mb-0.5">Applicable On</span>
                                <span className="text-gray-800 font-bold">{voucher.applicableOn}</span>
                            </div>
                        </div>
                        {voucher.terms && (
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Terms & Conditions:</p>
                                <ul className="list-disc list-inside space-y-0.5 pl-1">
                                    {voucher.terms.map((term, idx) => (
                                        <li key={idx}>{term}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherModal;
