import React from 'react';
import { Baby, CheckCircle2, Heart } from 'lucide-react';

const AboutUsPage = () => {
    return (
        <div className="min-h-screen font-sans bg-slate-50/50">
            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,182,193,0.2),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,192,203,0.1),transparent_50%)]"></div>
                <div className="section-container relative z-10">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm mb-8 border border-rose-100 animate-fade-in">
                            <Heart className="text-rose-400" size={16} fill="currentColor" />
                            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">The Heart of Our Brand</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                            The Origin <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400">
                                Mother’s Care
                            </span>
                        </h1>
                        
                        <p className="text-xl sm:text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
                            "We believe true quality is felt, not spoken."
                        </p>
                    </div>
                </div>
            </div>

            {/* Narrative Section */}
            <div className="section-container py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-slide-up">
                            <div className="inline-block p-4 bg-rose-50 rounded-3xl">
                                <Baby className="text-rose-400" size={32} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                Rooted in Motherhood
                            </h2>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                                <p className="font-semibold text-gray-800 text-xl border-l-4 border-rose-200 pl-6 py-2">
                                    We began not in a studio, but in a mother’s arms.
                                </p>
                                <p>
                                    Like every mother, we searched endlessly for products that felt truly right for her child—soft on the skin, gentle in touch, and made with honest care. What we found instead were compromises.
                                </p>
                                <p>
                                    Fabrics that looked beautiful but lacked comfort. Designs that followed trends but ignored tenderness. So we chose a different path.
                                </p>
                            </div>
                        </div>
                        <div className="relative animate-fade-in group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-100 to-pink-50 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative overflow-hidden rounded-[2.5rem] shadow-soft border border-white/80">
                                <img 
                                    src="/Images/aboutus/image1.jpg" 
                                    alt="Mother's Care Products" 
                                    className="w-full h-full object-cover rounded-[2.5rem]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quality Statement Section */}
            <div className="section-container py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-slate-900 text-white rounded-[3rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                        
                        <div className="relative z-10">
                            <span className="text-rose-400 font-bold uppercase tracking-widest text-sm mb-6 block">Our Signature Fabric</span>
                            <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
                                Bio washed Pure Cotton, <br/>
                                <span className="text-rose-300">Made to Hold Its Shape.</span>
                            </h2>
                            
                            <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-rose-400" size={24} />
                                    <span className="text-lg font-medium">No Shrinkage</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-rose-400" size={24} />
                                    <span className="text-lg font-medium">No Compromise</span>
                                </div>
                            </div>
                            
                            <p className="mt-12 text-slate-400 text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                                Each product reflects a balance of refined design and everyday comfort, made for children to move freely, feel secure, and be themselves.
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Founder Section */}
            <div className="section-container py-24 pb-32">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-soft border border-white/80 p-8 sm:p-20">
                        <div className="grid md:grid-cols-5 gap-12 items-center">
                            <div className="md:col-span-2 relative">
                                <div className="aspect-square rounded-[2.5rem] shadow-inner flex items-center justify-center group overflow-hidden">
                                    <img 
                                        src="/Images/aboutus/image2.jpg" 
                                        alt="Founder Sujitha Nishok" 
                                        className="w-full h-full object-cover rounded-[2.5rem]"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 bg-white py-4 px-8 rounded-2xl shadow-lg border border-slate-50 hidden sm:block">
                                    <p className="font-bold text-gray-900">Sujitha Nishok</p>
                                    <p className="text-rose-500 text-sm font-medium">Founder & Visionary</p>
                                </div>
                            </div>
                            
                            <div className="md:col-span-3 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-bold text-gray-900">The Founder's Desire</h3>
                                    <p className="text-xl text-gray-600 leading-relaxed italic font-light">
                                        “This brand was born from my desire to give children what I would give my own son (Aadhiran)—softness they can feel, comfort they can trust, and care woven quietly into every thread.”
                                    </p>
                                </div>
                                
                                <blockquote className="text-lg text-gray-500 bg-slate-50 p-8 rounded-2xl border-l-4 border-slate-200">
                                    “Every piece we create reflects the care, thought, and love a mother gives naturally.”
                                </blockquote>
                                
                                <div className="sm:hidden pt-4">
                                    <p className="font-bold text-gray-900">Sujitha Nishok</p>
                                    <p className="text-rose-500 text-sm font-medium">Founder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(180deg); }
                }
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

export default AboutUsPage;

