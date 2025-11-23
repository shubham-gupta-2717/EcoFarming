import React from 'react';
import { Flame } from 'lucide-react';

const StreakWidget = ({ streak, longestStreak }) => {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-5">
                <Flame className="w-24 h-24 text-eco-600" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-eco-50 rounded-lg">
                            <Flame className="w-5 h-5 text-eco-600" />
                        </div>
                        <span className="font-medium text-gray-500 text-sm uppercase tracking-wide">Current Streak</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold text-eco-700">{streak}</h2>
                        <span className="text-lg font-medium text-gray-500">days</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Best: {longestStreak} days
                    </p>
                </div>

                <div className="flex gap-1">
                    {[...Array(7)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-8 rounded-full transition-colors ${i < (streak % 7) || (streak > 0 && (streak % 7 === 0))
                                    ? 'bg-eco-500'
                                    : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StreakWidget;
