import React from 'react';
import { CheckCircle, Clock, ArrowRight, Droplets, Sprout, Bug, CloudSun, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
    water: <Droplets className="w-5 h-5 text-blue-500" />,
    soil: <Sprout className="w-5 h-5 text-amber-600" />,
    pest: <Bug className="w-5 h-5 text-red-500" />,
    weather_smart: <CloudSun className="w-5 h-5 text-yellow-500" />,
    organic: <Leaf className="w-5 h-5 text-green-500" />,
    general: <CheckCircle className="w-5 h-5 text-gray-500" />
};

const MissionCard = ({ mission, onStart }) => {
    const navigate = useNavigate();
    const isPending = mission.status === 'pending';
    const isActive = mission.status === 'active';
    const isCompleted = mission.status === 'completed';

    const handleAction = (e) => {
        e.stopPropagation();
        if (isPending) {
            onStart(mission.id);
        } else {
            navigate(`/dashboard/mission/${mission.id}`);
        }
    };

    return (
        <div
            onClick={() => navigate(`/dashboard/mission/${mission.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
        >
            {/* Status Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-300'
                }`} />

            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        {CATEGORY_ICONS[mission.category] || CATEGORY_ICONS.general}
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {mission.category.replace('_', ' ')}
                        </span>
                        <h3 className="font-semibold text-gray-900 leading-tight">{mission.title}</h3>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-eco-600">+{mission.points} pts</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${isCompleted ? 'bg-green-100 text-green-700' :
                        isActive ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {mission.status}
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {mission.description}
            </p>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{mission.difficulty}</span>
                </div>

                <button
                    onClick={handleAction}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isPending
                        ? 'bg-eco-600 text-white hover:bg-eco-700'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {isPending ? 'Start Mission' : 'View Details'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MissionCard;
