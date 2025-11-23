import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Heart, MessageCircle, Share2, MapPin, Trash2, Image, Video, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Community = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

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

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size too large. Please select a file under 10MB.');
            return;
        }

        setSelectedFile(file);
        setFileType(type);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileType(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !selectedFile) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('content', newPostContent);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await api.post('/community/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Add new post to top of list
            setPosts([response.data.post, ...posts]);
            setNewPostContent('');
            clearFile();
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

                    {/* File Preview */}
                    {previewUrl && (
                        <div className="relative mt-3 rounded-lg overflow-hidden bg-gray-100 max-h-64 inline-block">
                            <button
                                type="button"
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {fileType === 'image' ? (
                                <img src={previewUrl} alt="Preview" className="h-full object-contain max-h-64" />
                            ) : (
                                <video src={previewUrl} controls className="h-full object-contain max-h-64" />
                            )}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-3">
                            <input
                                type="file"
                                ref={imageInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'image')}
                            />
                            <input
                                type="file"
                                ref={videoInputRef}
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, 'video')}
                            />
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                            >
                                <Image className="w-5 h-5" />
                                <span className="text-sm font-medium">Photo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                                <Video className="w-5 h-5" />
                                <span className="text-sm font-medium">Video</span>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || (!newPostContent.trim() && !selectedFile)}
                            className="bg-eco-600 text-white px-6 py-2 rounded-lg hover:bg-eco-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {submitting ? 'Posting...' : 'Post'}
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

                        {post.content && (
                            <div className="px-4 pb-3">
                                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                            </div>
                        )}

                        {post.mediaUrl && (
                            <div className="bg-gray-100">
                                {post.mediaType === 'video' ? (
                                    <video
                                        src={post.mediaUrl}
                                        controls
                                        className="w-full max-h-[500px] object-contain"
                                    />
                                ) : (
                                    <img
                                        src={post.mediaUrl}
                                        alt="Post content"
                                        className="w-full max-h-[500px] object-contain"
                                    />
                                )}
                            </div>
                        )}
                        {/* Legacy support for old 'image' field */}
                        {!post.mediaUrl && post.image && (
                            <img src={post.image} alt="Post" className="w-full h-64 object-cover bg-gray-100" />
                        )}

                        <div className="p-4 flex items-center gap-6 border-t border-gray-50">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
                                <Heart className="w-5 h-5" />
                                <span className="text-sm">{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm">{post.comments}</span>
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
