import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, MapPin, ArrowLeft, Loader2, Image, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminCommunity = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

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

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

        try {
            // Admin uses the same delete endpoint, backend should verify admin role if needed, 
            // but for now we rely on the fact that admins can access this page.
            // Wait, the current backend deletePost checks if authorId matches user.uid.
            // We need to update backend to allow admins to delete ANY post.

            // Let's try calling the delete endpoint. If it fails, we know we need to update backend.
            await api.delete(`/community/post/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post. You might not have permission or the backend check restricts it.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Community Moderation</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-eco-100 rounded-full flex items-center justify-center text-eco-700 font-bold">
                                            {post.author ? post.author[0] : 'F'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{post.author}</h3>
                                            <div className="flex items-center text-xs text-gray-500 gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {post.location} • {post.time}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Delete</span>
                                    </button>
                                </div>

                                <div className="mt-3 ml-13 pl-13">
                                    <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

                                    {post.mediaUrl && (
                                        <div className="mt-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 max-w-md">
                                            {post.mediaType === 'video' ? (
                                                <video src={post.mediaUrl} controls className="w-full max-h-64 object-contain" />
                                            ) : (
                                                <img src={post.mediaUrl} alt="Post content" className="w-full max-h-64 object-contain" />
                                            )}
                                        </div>
                                    )}
                                    {/* Legacy image support */}
                                    {!post.mediaUrl && post.image && (
                                        <img src={post.image} alt="Post" className="mt-3 w-full max-w-md h-48 object-cover rounded-lg" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No posts found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCommunity;
