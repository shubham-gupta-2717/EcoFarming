import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, ShieldCheck, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post, onLike, onDelete, onReplyClick, latestReply }) => {
    const { user } = useAuth();
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    const isLiked = post.likedBy?.includes(user?.uid);
    const isAuthor = post.authorId === user?.uid;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    // Listen for new replies via prop
    React.useEffect(() => {
        if (latestReply) {
            console.log(`[PostCard ${post.id}] Received new reply:`, latestReply);
            setReplies(prev => {
                // Avoid duplicates if possible (though simple append is usually fine for this demo)
                if (prev.find(r => r.id === latestReply.id)) return prev;
                return [...prev, latestReply];
            });
            if (!showReplies) setShowReplies(true);
        }
    }, [latestReply]);

    const handleRepliesClick = async () => {
        if (!showReplies && replies.length === 0) {
            setLoadingReplies(true);
            try {
                const response = await api.get(`/community/replies/${post.id}`);
                setReplies(response.data.replies);
            } catch (error) {
                console.error("Failed to fetch replies", error);
            } finally {
                setLoadingReplies(false);
            }
        }
        setShowReplies(!showReplies);
    };

    const handleReplyDelete = async (replyId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) return;
        try {
            await api.delete(`/community/reply/${replyId}`);
            setReplies(replies.filter(r => r.id !== replyId));
            // Update local comment count
            // Note: This won't update the parent post's comment count in the feed list immediately 
            // unless we propagate it up, but for now let's just update the replies list.
        } catch (error) {
            console.error("Failed to delete reply", error);
            alert('Failed to delete reply');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-100 to-eco-200 flex items-center justify-center text-eco-700 font-bold text-lg">
                        {post.author[0]?.toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{post.author}</h3>
                            {post.userType === 'admin' && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                    <ShieldCheck className="w-3 h-3" /> Admin
                                </span>
                            )}
                            {post.userType === 'institution' && (
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                    <Building2 className="w-3 h-3" /> {post.institutionName || 'Institution'}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {post.location && <span>{post.location} •</span>}
                            <span>{post.time}</span>
                        </p>
                    </div>
                </div>
                {(isAuthor || isAdmin) && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Media */}
            {post.mediaUrl && (
                <div className="mt-2 bg-gray-50 border-y border-gray-100">
                    {post.mediaType === 'video' ? (
                        <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-h-[500px] object-contain"
                            preload="metadata"
                        />
                    ) : (
                        <img
                            src={post.mediaUrl}
                            alt="Post content"
                            className="w-full max-h-[500px] object-contain"
                            loading="lazy"
                        />
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-2">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-2 text-sm font-medium transition ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes || 0}</span>
                    </button>

                    <button
                        onClick={handleRepliesClick}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-eco-600 transition"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments || 0}</span>
                    </button>

                    <button className="text-gray-400 hover:text-gray-600 transition">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <button
                    onClick={() => onReplyClick(post.id)}
                    className="text-sm font-medium text-eco-600 hover:text-eco-700"
                >
                    Reply
                </button>
            </div>

            {/* Replies Section */}
            {showReplies && (
                <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {loadingReplies ? (
                        <div className="text-center text-gray-500 text-sm py-2">Loading replies...</div>
                    ) : replies.length > 0 ? (
                        replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                    {reply.userName?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 bg-white p-3 rounded-lg rounded-tl-none border border-gray-100 shadow-sm relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-gray-900">{reply.userName}</span>
                                            {reply.userType === 'institution' && (
                                                <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full border border-blue-100">Official</span>
                                            )}
                                            {reply.userType === 'admin' && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">{reply.time}</span>
                                            {(reply.userId === user?.uid || isAdmin) && (
                                                <button
                                                    onClick={() => handleReplyDelete(reply.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                                                    title="Delete reply"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-2">No replies yet. Be the first!</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostCard;
