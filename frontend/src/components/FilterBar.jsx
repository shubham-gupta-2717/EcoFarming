import React from 'react';
import { Filter, Image, Video, Building2, Flame } from 'lucide-react';

const FilterBar = ({ activeFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'All Posts', icon: <Filter className="w-4 h-4" /> },
        { id: 'popular', label: 'Popular', icon: <Flame className="w-4 h-4 text-orange-500" /> },
        { id: 'photos', label: 'Photos', icon: <Image className="w-4 h-4 text-blue-500" /> },
        { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4 text-red-500" /> },
        { id: 'institution', label: 'Official', icon: <Building2 className="w-4 h-4 text-green-600" /> },
    ];

    return (
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === filter.id
                            ? 'bg-eco-600 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {filter.icon}
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
