import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Heart, MessageCircle, Share2, MapPin, Trash2, Image, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Community = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            setSubmitting(true);
            const response = await api.post('/community/post', {
                content: newPostContent
            });

            // Add new post to top of list
            setPosts([response.data.post, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.error("Failed to create post", error);
            alert("Failed to create post. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/community/post/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Community Feed 🌍</h1>
                <p className="text-gray-600">See what other farmers are achieving.</p>
            </header>

            {/* Create Post Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <form onSubmit={handlePostSubmit}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your farming updates, tips, or questions..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-eco-500 focus:border-transparent resize-none"
                        rows="3"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-3">
                            <button type="button" className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors border border-green-100">
                                <Image className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload Image</span>
                            </button>
                            <button type="button" className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                                <Video className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload Video</span>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !newPostContent.trim()}
                            className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {submitting ? 'Posting...' : 'Post Update'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
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
                            {user && post.authorId === user.uid && (
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="ml-auto text-gray-400 hover:text-red-500 transition"
                                    title="Delete Post"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
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
