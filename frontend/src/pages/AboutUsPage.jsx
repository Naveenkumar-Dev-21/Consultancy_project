import React, { useMemo } from 'react';
import { Heart, Sparkles, Baby, Shield, Leaf, Star } from 'lucide-react';

const AboutUsPage = () => {
    const floatingBubbles = useMemo(() => [...Array(20)].map((_, i) => ({
        id: i,
        width: `${(i * 37) % 50 + 50}px`,
        height: `${(i * 29) % 50 + 50}px`,
        top: `${(i * 13) % 100}%`,
        left: `${(i * 17) % 100}%`,
        animationDuration: `${(i % 5) * 2 + 10}s`
    })), []);

    return (
        <div className="min-h-screen font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-pink-100/20 to-transparent"></div>
                <div className="section-container py-14 sm:py-20 relative z-10">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-soft mb-6 sm:mb-8 border border-rose-100">
                            <Heart className="text-rose-500" size={18} fill="currentColor" />
                            <span className="text-xs sm:text-sm font-bold text-rose-500 uppercase tracking-wider">Our Story</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 mb-4 sm:mb-6 leading-tight">
                            Little Buds
                        </h1>
                        
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                            Where every stitch carries a mother's love, and every fabric tells a story of care.
                        </p>
                    </div>
                </div>
            </div>

            {/* Origin Story Section */}
            <div className="section-container py-14 sm:py-20">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-soft border border-rose-100/60">
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <Sparkles className="text-white" size={22} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                                The Origin - Rooted in Motherhood
                            </h2>
                        </div>
                        
                        <div className="space-y-5 sm:space-y-6 text-base sm:text-lg text-gray-600 leading-relaxed">
                            <p className="text-lg sm:text-xl font-medium text-gray-800">
                                We began not in a studio, but in a mother's arms.
                            </p>
                            
                            <p>
                                Like every mother, we searched endlessly for products that felt truly right for her child—soft on the skin, gentle in touch, and made with honest care. What we found instead were compromises. Fabrics that looked beautiful but lacked comfort. Designs that followed trends but ignored tenderness. So we chose a different path.
                            </p>
                            
                            <p>
                                And began creating pieces the way a mother would choose for her own child—slowly, thoughtfully, and without shortcuts. Every fabric was touched, tested, and trusted. Every stitch was guided by patience. Comfort was never optional. Safety was never assumed.
                            </p>
                            
                            <p>
                                Each product reflects a balance of refined design and everyday comfort, made for children to move freely, feel secure, and be themselves.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="section-container py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
                        What Guides Us
                    </h2>
                    
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
                        {[
                            {
                                icon: Baby,
                                title: "Comfort First",
                                desc: "Softness that children can feel, woven into every thread",
                                gradient: "from-rose-400 to-pink-500"
                            },
                            {
                                icon: Shield,
                                title: "Safety Always",
                                desc: "Trusted materials, tested thoroughly for your peace of mind",
                                gradient: "from-pink-500 to-rose-500"
                            },
                            {
                                icon: Leaf,
                                title: "Natural Care",
                                desc: "Organic, breathable fabrics that respect delicate skin",
                                gradient: "from-green-400 to-teal-500"
                            }
                        ].map((value, idx) => (
                            <div 
                                key={idx} 
                                className="group relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card hover:shadow-soft transition-all duration-500 hover:-translate-y-2 border border-rose-100/60"
                            >
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-rose-500/20`}>
                                    <value.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-base">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Philosophy Quote */}
            <div className="section-container py-14 sm:py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="relative bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 rounded-2xl sm:rounded-[3rem] p-1 shadow-lg shadow-rose-500/20">
                        <div className="bg-white rounded-2xl sm:rounded-[2.8rem] p-8 sm:p-12 md:p-16">
                            <div className="flex justify-center mb-5 sm:mb-6">
                                <Star className="text-amber-400" size={44} fill="currentColor" />
                            </div>
                            
                            <blockquote className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-800 leading-relaxed mb-5 sm:mb-6">
                                "We believe true quality is felt, not spoken."
                            </blockquote>
                            
                            <p className="text-base sm:text-lg text-center text-gray-500 leading-relaxed max-w-2xl mx-auto">
                                It is found in the softness of a seam, the breathability of a fabric, and the quiet confidence of a garment made with love.
                            </p>
                            
                            <p className="text-base sm:text-lg text-center text-gray-700 font-medium italic mt-6 sm:mt-8">
                                It is a mother's care—passed gently from our hands to your child.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand Promise */}
            <div className="section-container py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 md:p-16 text-center shadow-soft border border-rose-200/50">
                        <div className="inline-flex items-center gap-2 bg-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-md mb-6 sm:mb-8">
                            <Heart className="text-rose-500" size={18} fill="currentColor" />
                            <span className="text-xs sm:text-sm font-bold text-rose-500 uppercase tracking-wider">Our Promise</span>
                        </div>
                        
                        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed">
                            "When it comes to little buds, there are no compromises. Every piece we create reflects the care, thought, and love a mother gives naturally."
                        </p>
                    </div>
                </div>
            </div>

            {/* Founder Section */}
            <div className="section-container py-14 sm:py-20 pb-20 sm:pb-32">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-[3rem] shadow-soft overflow-hidden border border-rose-100/60">
                        <div className="grid md:grid-cols-5">
                            {/* Left Side */}
                            <div className="md:col-span-2 bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-10 sm:p-16 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20">
                                    {floatingBubbles.map((bubble) => (
                                        <div 
                                            key={bubble.id} 
                                            className="absolute bg-white rounded-full"
                                            style={{
                                                width: bubble.width,
                                                height: bubble.height,
                                                top: bubble.top,
                                                left: bubble.left,
                                                animation: `float ${bubble.animationDuration} ease-in-out infinite`
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                <div className="relative z-10 text-center">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6">
                                        <Heart className="text-rose-500" size={56} fill="currentColor" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                                        Sujitha Nishok
                                    </h3>
                                    <p className="text-white/90 font-medium mt-2 drop-shadow text-base">Founder</p>
                                </div>
                            </div>
                            
                            {/* Right Side */}
                            <div className="md:col-span-3 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                                <div className="mb-5 sm:mb-6">
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-rose-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                </div>
                                
                                <blockquote className="text-lg sm:text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-5 sm:mb-6">
                                    This brand was born from my desire to give children what I would give my own son (Aadhiran)—softness they can feel, comfort they can trust, and care woven quietly into every thread.
                                </blockquote>
                                
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"></div>
                                    <p className="font-bold text-gray-900 text-base">Sujitha Nishok</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Animation Keyframes */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `}</style>
        </div>
    );
};

export default AboutUsPage;
