import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

const ReplyModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [replyText, setReplyText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onSubmit(replyText);
        setReplyText('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Write a Reply</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-500 min-h-[100px] resize-none"
                        autoFocus
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={!replyText.trim() || isSubmitting}
                            className="flex items-center gap-2 bg-eco-600 text-white px-4 py-2 rounded-lg hover:bg-eco-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Post Reply
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReplyModal;
