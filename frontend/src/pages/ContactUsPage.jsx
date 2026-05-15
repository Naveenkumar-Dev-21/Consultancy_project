import React from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Heart, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ContactUsPage = () => {
    const toast = useToast();
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/contact', formData);
            toast.success('Thank you for reaching out! We will get back to you soon.');
            setFormData({
                name: '',
                email: '',
                subject: 'General Inquiry',
                message: ''
            });
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans bg-slate-50/50">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,182,193,0.2),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,192,203,0.1),transparent_50%)]"></div>
                <div className="section-container relative z-10">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm mb-8 border border-rose-100 animate-fade-in">
                            <MessageCircle className="text-rose-400" size={16} fill="currentColor" />
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">Connect With Us</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                            We'd Love to <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400">
                                Hear From You
                            </span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
                            "Whether you have a question or just want to say hi, our doors are always open."
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Content */}
            <div className="section-container py-12 pb-32">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Information */}
                        <div className="space-y-12 animate-slide-up">
                            <div className="space-y-6">
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                    Get in Touch
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed font-light max-w-md">
                                    Have a question about our products, an order, or just want some advice on baby essentials? We're here to help.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-1 gap-6">
                                <div className="flex items-start gap-6 p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/80 group hover:border-rose-200 transition-all">
                                    <div className="p-4 bg-rose-50 rounded-2xl text-rose-400 group-hover:bg-rose-400 group-hover:text-white transition-all">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</h4>
                                        <p className="text-xl font-bold text-gray-900 break-all">aadhiranbabyproducts@gmail.com</p>
                                        <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/80 group hover:border-rose-200 transition-all">
                                    <div className="p-4 bg-sky-50 rounded-2xl text-sky-400 group-hover:bg-sky-400 group-hover:text-white transition-all">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Call Us</h4>
                                        <p className="text-xl font-bold text-gray-900">+91 94876 05109</p>
                                        <p className="text-sm text-gray-500 mt-1">Mon - Sat, 9am - 6pm IST</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-soft border border-white/80 group hover:border-rose-200 transition-all">
                                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-400 group-hover:bg-amber-400 group-hover:text-white transition-all">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Visit Us</h4>
                                        <p className="text-xl font-bold text-gray-900">21, TVS street, PS park, Erode, Tamilnadu, 638001</p>
                                        <p className="text-sm text-gray-500 mt-1">Our creative studio and office.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="relative animate-fade-in group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-100 to-pink-50 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative bg-white/80 backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] shadow-soft border border-white/80">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-4">Full Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-4">Email Address</label>
                                            <input 
                                                required
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-4">Subject</label>
                                        <select 
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option>General Inquiry</option>
                                            <option>Order Status</option>
                                            <option>Partnership</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-4">Message</label>
                                        <textarea 
                                            required
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows="5" 
                                            placeholder="Tell us how we can help..."
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:from-rose-500 hover:to-pink-600 transition-all shadow-xl shadow-rose-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }
                .animate-slide-up {
                    animation: slideUp 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .shadow-soft {
                    box-shadow: 0 20px 50px rgba(0,0,0,0.05);
                }
                .section-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
};

export default ContactUsPage;
