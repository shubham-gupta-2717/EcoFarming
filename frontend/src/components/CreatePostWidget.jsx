import React, { useState, useRef } from 'react';
import { Image, Video, Send, Plus, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreatePostWidget = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size too large (max 10MB)');
                return;
            }
            setSelectedFile(file);
            setFileType(type);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handlePostSubmit = async () => {
        if (!newPostContent.trim() && !selectedFile) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('content', newPostContent);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            const response = await api.post('/community/post', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reset form
            setNewPostContent('');
            clearFile();

            // Notify parent
            if (onPostCreated) {
                onPostCreated(response.data.post);
            }
        } catch (error) {
            console.error("Failed to create post", error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center text-eco-700 font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.name}?`}
                        className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-eco-200 min-h-[80px] resize-none"
                    />

                    {previewUrl && (
                        <div className="relative mt-2 inline-block">
                            {fileType === 'video' ? (
                                <video src={previewUrl} className="h-32 rounded-lg border border-gray-200" />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="h-32 rounded-lg border border-gray-200" />
                            )}
                            <button
                                onClick={clearFile}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    fileInputRef.current.accept = "image/*";
                                    fileInputRef.current.click();
                                }}
                                className="flex items-center gap-1 text-gray-500 hover:text-eco-600 text-sm px-2 py-1 rounded hover:bg-gray-50 transition"
                            >
                                <Image className="w-4 h-4" />
                                Photo
                            </button>
                            <button
                                onClick={() => {
                                    fileInputRef.current.accept = "video/*";
                                    fileInputRef.current.click();
                                }}
                                className="flex items-center gap-1 text-gray-500 hover:text-eco-600 text-sm px-2 py-1 rounded hover:bg-gray-50 transition"
                            >
                                <Video className="w-4 h-4" />
                                Video
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => handleFileSelect(e, fileInputRef.current.accept.includes('video') ? 'video' : 'image')}
                            />
                        </div>
                        <button
                            onClick={handlePostSubmit}
                            disabled={(!newPostContent.trim() && !selectedFile) || isSubmitting}
                            className="bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostWidget;
