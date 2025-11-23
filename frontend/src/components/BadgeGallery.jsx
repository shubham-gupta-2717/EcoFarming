import React from 'react';
import { Lock, Droplets, Sprout, Bug, CloudSun, Leaf, Flame, Users, BookOpen, Award } from 'lucide-react';

const ICONS = {
    Droplets, Sprout, Bug, CloudSun, Leaf, Flame, Users, BookOpen, Wheat: Sprout
};

const BadgeGallery = ({ badges }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
                const Icon = ICONS[badge.icon] || Award;
                const isEarned = badge.earned;

                return (
                    <div
                        key={badge.id}
                        className={`relative p-4 rounded-xl border flex flex-col items-center text-center transition-all ${isEarned
                                ? 'bg-white border-eco-100 shadow-sm'
                                : 'bg-gray-50 border-gray-100 opacity-70 grayscale'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isEarned ? 'bg-eco-100 text-eco-600' : 'bg-gray-200 text-gray-400'
                            }`}>
                            {isEarned ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                        </div>

                        <h4 className={`font-semibold text-sm mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                            {badge.name}
                        </h4>

                        <p className="text-xs text-gray-500 line-clamp-2">
                            {badge.description}
                        </p>

                        {isEarned && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BadgeGallery;
