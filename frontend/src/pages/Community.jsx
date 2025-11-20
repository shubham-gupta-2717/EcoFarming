import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

const Community = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await api.get('/community/feed');
                setPosts(response.data.posts);
            } catch (error) {
                console.error("Failed to fetch feed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Community Feed 🌍</h1>
                <p className="text-gray-600">See what other farmers are achieving.</p>
            </header>

            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-bold">
                                {post.author[0]}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">{post.author}</h3>
                                <div className="flex items-center text-xs text-gray-500 gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {post.location} • {post.time}
                                </div>
                            </div>
                        </div>

                        <div className="px-4 pb-2">
                            <p className="text-gray-700">{post.content}</p>
                        </div>

                        {post.image && (
                            <img src={post.image} alt="Post" className="w-full h-64 object-cover bg-gray-100" />
                        )}

                        <div className="p-4 flex items-center gap-6 border-t border-gray-50">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
                                <Heart className="w-5 h-5" />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                                <MessageCircle className="w-5 h-5" />
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition ml-auto">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {loading && <div className="text-center p-8 text-gray-500">Loading feed...</div>}
        </div>
    );
};

export default Community;
