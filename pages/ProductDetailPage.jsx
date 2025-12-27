import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchProduct = async () => { // Move fetch to function for reuse
        try {
            const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            await axios.post(`/api/products/${id}/reviews`, { rating, comment }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            alert('Review Submitted Successfully!');
            setComment('');
            setRating(5);
            // Refresh product data to show new review
            await fetchProduct();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-beelittle-coral border-t-transparent"></div></div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    return (
        <div className="bg-white min-h-screen font-sans">
            <div className="section-container py-12">
                {/* Back Link */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-bold mb-8 transition-colors">
                    <ChevronLeft size={18} /> Back to Products
                </button>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Sticky Image */}
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-zinc-50 rounded-[3rem] overflow-hidden p-12 relative shadow-sm">
                            <img
                                src={product.image || "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800"}
                                alt={product.name}
                                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply"
                            />
                            {product.stock <= 0 && (
                                <div className="absolute top-8 left-8 bg-zinc-900 text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm">
                                    Sold Out
                                </div>
                            )}
                        </div>

                        {/* Features Badges */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            {[
                                { icon: ShieldCheck, label: "Safety First", desc: "Certified Secure" },
                                { icon: Truck, label: "Fast Shipping", desc: "2-4 Days Delivery" },
                                { icon: RefreshCcw, label: "Easy Returns", desc: "7 Day Policy" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <item.icon className="text-zinc-900 mb-3" size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">{item.label}</span>
                                    <span className="text-[10px] font-medium text-zinc-500">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-10 py-4">
                        <div>
                            <span className="inline-block text-sm font-bold text-beelittle-coral mb-3 uppercase tracking-wider">
                                {product.category || 'New Collection'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-zinc-100 px-3 py-1 rounded-full">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < Math.floor(product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-zinc-500">({product.numReviews || 0} Reviews)</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-4xl font-bold text-zinc-900">₹{product.price}</p>
                            <p className="text-zinc-600 leading-relaxed text-lg">
                                {product.description || "Thoughtfully designed for maximum comfort and style. Our premium clothing ensures your little one stays cozy all day long."}
                            </p>
                        </div>

                        {/* Specifications Grid */}
                        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 text-zinc-900">Product Details</h3>
                            <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Age Group</p>
                                    <p className="font-bold text-zinc-800">{product.ageGroup || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Material</p>
                                    <p className="font-bold text-zinc-800">100% Organic Cotton</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Size</p>
                                    <p className="font-bold text-zinc-800">{product.size || "Standard"}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Availability</p>
                                    <p className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={addToCartHandler}
                                disabled={product.stock === 0}
                                className={`flex-1 py-5 rounded-full font-bold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all
                                    ${product.stock === 0
                                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                        : isAdded
                                            ? 'bg-green-500 text-white shadow-green-500/20'
                                            : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20'}
                                `}
                            >
                                {isAdded ? <CheckCircle2 size={22} /> : <ShoppingCart size={22} />}
                                {product.stock === 0 ? 'Out of Stock' : isAdded ? 'Added to Bag' : 'Add to Bag'}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-32 pt-16 border-t border-zinc-100">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">Customer Reviews</h2>

                        <div className="grid md:grid-cols-12 gap-12">
                            {/* Review Form - Takes 5 cols */}
                            <div className="md:col-span-5">
                                {userInfo ? (
                                    <div className="bg-zinc-50 p-8 rounded-[30px] sticky top-24">
                                        <h3 className="text-xl font-bold mb-2">Write a Review</h3>
                                        <p className="text-sm text-zinc-500 mb-6">Share your thoughts with other parents.</p>

                                        <form onSubmit={submitReviewHandler} className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setRating(s)}
                                                            className={`p-1 transition-transform active:scale-95 ${rating >= s ? 'text-yellow-400' : 'text-zinc-300'}`}
                                                        >
                                                            <Star className={rating >= s ? 'fill-yellow-400' : ''} size={28} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Your Review</label>
                                                <textarea
                                                    rows="4"
                                                    placeholder="The quality is amazing..."
                                                    className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-zinc-900 outline-none transition-all shadow-sm resize-none"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={reviewLoading}
                                                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                                            >
                                                {reviewLoading ? 'Submitting...' : 'Post Review'} <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-50 p-8 rounded-[30px] text-center">
                                        <p className="text-zinc-600 mb-4 font-medium">Please login to write a review.</p>
                                        <button onClick={() => navigate('/login')} className="px-8 py-3 bg-zinc-900 text-white rounded-full font-bold shadow-lg">Login Now</button>
                                    </div>
                                )}
                            </div>

                            {/* Reviews List - Takes 7 cols */}
                            <div className="md:col-span-7 space-y-6">
                                {product.reviews && product.reviews.length > 0 ? (
                                    product.reviews.map((review) => (
                                        <div key={review._id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                        {review.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 text-sm">{review.name}</p>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={10} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-zinc-600 text-sm leading-relaxed">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 border-2 border-dashed border-zinc-100 rounded-[30px]">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Star className="text-zinc-300" size={24} />
                                        </div>
                                        <p className="text-zinc-400 font-medium">No reviews yet. Be the first to share!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
