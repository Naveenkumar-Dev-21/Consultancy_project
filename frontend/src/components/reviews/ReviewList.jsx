import React from 'react';
import { Star, User, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ReviewList = ({ reviews = [] }) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-16 bg-rose-50/30 rounded-3xl border border-dashed border-rose-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare size={24} className="text-rose-300" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h4>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div 
                    key={review._id} 
                    className="apple-card p-6 sm:p-8 animate-fade-in"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center border border-rose-200 shadow-sm">
                                <User size={20} className="text-rose-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 leading-none mb-1.5">{review.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                    <Calendar size={12} />
                                    {format(new Date(review.createdAt), 'MMMM dd, yyyy')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-black text-amber-600">{review.rating}.0</span>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-base">
                        "{review.comment}"
                    </p>

                    <div className="mt-6 pt-6 border-t border-rose-50 flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Verified Purchase
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
