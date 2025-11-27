import React, { useState, useEffect, useRef } from 'react';
import { Image, Video, Send, Loader2, Plus } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import FilterBar from '../components/FilterBar';
import ReplyModal from '../components/ReplyModal';
import CreatePostWidget from '../components/CreatePostWidget';
import { useAuth } from '../context/AuthContext';

const Community = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Location Filter State
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSubDistrict, setSelectedSubDistrict] = useState('');

    // Reply State
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [activePostId, setActivePostId] = useState(null);
    const [replySubmitting, setReplySubmitting] = useState(false);
    const [latestReply, setLatestReply] = useState(null); // { postId, reply }

    useEffect(() => {
        fetchPosts();
    }, [filter, selectedState, selectedDistrict, selectedSubDistrict]);

    // Fetch States on Mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await api.get('/locations/states');
                setStates(res.data);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        };
        fetchStates();
    }, []);

    // Fetch Districts
    useEffect(() => {
        if (selectedState) {
            const fetchDistricts = async () => {
                try {
                    const res = await api.get(`/locations/districts/${selectedState}`);
                    setDistricts(res.data);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        } else {
            setDistricts([]);
            setSelectedDistrict('');
            setSelectedSubDistrict('');
        }
    }, [selectedState]);

    // Fetch Sub-Districts
    useEffect(() => {
        if (selectedState && selectedDistrict) {
            const fetchSubDistricts = async () => {
                try {
                    const res = await api.get(`/locations/sub-districts/${selectedState}/${selectedDistrict}`);
                    setSubDistricts(res.data);
                } catch (error) {
                    console.error("Error fetching sub-districts:", error);
                }
            };
            fetchSubDistricts();
        } else {
            setSubDistricts([]);
            setSelectedSubDistrict('');
        }
    }, [selectedDistrict]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let query = `/community/feed?filter=${filter}`;
            if (selectedState) query += `&state=${selectedState}`;
            if (selectedDistrict) query += `&district=${selectedDistrict}`;
            if (selectedSubDistrict) query += `&subDistrict=${selectedSubDistrict}`;

            const response = await api.get(query);
            setPosts(response.data.posts);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/community/post/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert('Failed to delete post');
        }
    };

    const handleLike = async (postId) => {
        // Optimistic update
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const isLiked = post.likedBy?.includes(user.uid);
                const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
                const newLikedBy = isLiked
                    ? post.likedBy.filter(id => id !== user.uid)
                    : [...(post.likedBy || []), user.uid];

                return { ...post, likes: newLikes, likedBy: newLikedBy };
            }
            return post;
        }));

        try {
            await api.post(`/community/like/${postId}`);
        } catch (error) {
            console.error("Failed to like post", error);
            // Revert on error (could be improved)
            fetchPosts();
        }
    };

    const openReplyModal = (postId) => {
        setActivePostId(postId);
        setReplyModalOpen(true);
    };

    const handleReplySubmit = async (text) => {
        setReplySubmitting(true);
        try {
            console.log(`[Community] Submitting reply for post ${activePostId}`);
            const response = await api.post(`/community/reply/${activePostId}`, { text });
            const newReply = response.data.reply;
            console.log('[Community] Reply created:', newReply);

            // Update comment count locally
            setPosts(posts.map(post => {
                if (post.id === activePostId) {
                    return {
                        ...post,
                        comments: (post.comments || 0) + 1,
                    };
                }
                return post;
            }));

            // Pass new reply to PostCard via prop
            setLatestReply({ postId: activePostId, reply: newReply });

            setReplyModalOpen(false);
        } catch (error) {
            console.error("Failed to reply", error);
            alert('Failed to send reply');
        } finally {
            setReplySubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Community Feed 🌾</h1>
                <p className="text-gray-600">Connect, share, and grow with fellow farmers.</p>
            </header>

            {/* Create Post Widget */}
            <CreatePostWidget onPostCreated={handlePostCreated} />

            {/* Filter Bar */}
            <FilterBar activeFilter={filter} onFilterChange={setFilter} />

            {/* Location Filter */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-2">
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300"
                >
                    <option value="">All States</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300"
                    disabled={!selectedState}
                >
                    <option value="">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                    value={selectedSubDistrict}
                    onChange={(e) => setSelectedSubDistrict(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-eco-300"
                    disabled={!selectedDistrict}
                >
                    <option value="">All Sub-Districts</option>
                    {subDistricts.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                </select>
            </div>

            {/* Feed */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-eco-600" />
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onLike={handleLike}
                            onDelete={handleDeletePost}
                            onReplyClick={openReplyModal}
                            latestReply={latestReply?.postId === post.id ? latestReply.reply : null}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">No posts found. Be the first to share!</p>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            <ReplyModal
                isOpen={replyModalOpen}
                onClose={() => setReplyModalOpen(false)}
                onSubmit={handleReplySubmit}
                isSubmitting={replySubmitting}
            />
        </div>
    );
};

export default Community;
