import React, { useState } from 'react';
import { Star, Send, StarHalf } from 'lucide-react';
import api from '../../services/api';

const ReviewForm = ({ productId, onReviewAdded, existingReviews }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        return (
            <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-6 text-center">
                <p className="text-gray-600 mb-4">Please sign in to share your experience with this product.</p>
                <button 
                    onClick={() => window.location.href = '/login'}
                    className="btn-primary px-8 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const hasReviewed = existingReviews?.some(r => r.user?._id === userInfo._id || r.user === userInfo._id);

    if (hasReviewed) {
        return (
            <div className="bg-green-50/50 border border-green-100/60 rounded-2xl p-6 text-center">
                <p className="text-green-700 font-medium">Thank you! You've already reviewed this product.</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Please share your thoughts in a comment.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post(`/api/reviews/${productId}`, { rating, comment });
            setComment('');
            setRating(5);
            if (onReviewAdded) onReviewAdded(data.review);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <p className="text-gray-500 text-sm">Your feedback helps other parents make better choices.</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Rating</label>
                <div className="flex gap-1.5">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <button
                                key={index}
                                type="button"
                                className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHover(starValue)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={32}
                                    className={`${(hover || rating) >= starValue ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        );
                    })}
                    <span className="ml-3 text-lg font-bold text-amber-500 self-center">
                        {hover || rating}.0
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Your Experience</label>
                <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you and your little one think of this product?"
                    className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl p-4 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all placeholder:text-gray-400 resize-none text-base"
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto px-10 py-4 rounded-2xl uppercase tracking-widest text-sm font-black flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Send size={18} />
                        Post Review
                    </>
                )}
            </button>
        </form>
    );
};

export default ReviewForm;
