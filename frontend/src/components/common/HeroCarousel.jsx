import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Truck, Leaf, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: "/Images/Carousel/boy_linen_1.png",
        title: "The Linen Edit",
        subtitle: "Timeless, breathable linen for your little gentleman.",
        position: "center 20%",
        accent: "from-rose-500/80 to-pink-600/80",
    },
    {
        id: 2,
        image: "/Images/Carousel/boy_linen_2.png",
        title: "Garden Adventures",
        subtitle: "Soft-as-air sage linen rompers for outdoor play.",
        position: "75% 15%",
        accent: "from-emerald-500/80 to-teal-600/80",
    },
    {
        id: 3,
        image: "/Images/Carousel/boy_linen_3.png",
        title: "Pure Comfort",
        subtitle: "Minimalist cream linen sets for cozy moments.",
        position: "center 25%",
        accent: "from-amber-500/80 to-orange-600/80",
    }
];

const SLIDE_INTERVAL = 5000;

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [progressKey, setProgressKey] = useState(0);
    const navigate = useNavigate();

    const goNext = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setProgressKey((k) => k + 1);
    }, []);

    const goPrev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        setProgressKey((k) => k + 1);
    }, []);

    useEffect(() => {
        const timer = setInterval(goNext, SLIDE_INTERVAL);
        return () => clearInterval(timer);
    }, [goNext]);

    const handleDotClick = (idx) => {
        setCurrent(idx);
        setProgressKey((k) => k + 1);
    };

    // Staggered text variants
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };
    const itemVariants = {
        hidden: { y: 40, opacity: 0, filter: 'blur(8px)' },
        visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="relative w-full h-[340px] sm:h-[440px] md:h-[540px] lg:h-[640px] overflow-hidden bg-charcoal-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div className="w-full h-full relative overflow-hidden">
                        {/* Ken Burns image */}
                        <motion.img
                            key={`img-${current}`}
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: slides[current].position }}
                            initial={{ scale: 1.12 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 7, ease: 'easeOut' }}
                        />

                        {/* Multi-layer gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/5" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${slides[current].accent} opacity-10`} />

                        {/* Content with stagger and blur reveal */}
                        <div className="absolute inset-0 flex items-end sm:items-center justify-start">
                            <motion.div
                                className="section-container pb-20 sm:pb-0 max-w-4xl"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div variants={itemVariants}>
                                    <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-4 sm:mb-5 border border-white/20">
                                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                                        New Collection
                                    </span>
                                </motion.div>
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-3 sm:mb-5 tracking-tighter leading-[0.9] drop-shadow-2xl"
                                    style={{ fontFamily: '"Migra", "Cormorant Garamond", serif' }}
                                >
                                    {slides[current].title.split(' ').map((word, i) => (
                                        <span key={i}>
                                            {i > 0 && ' '}
                                            {i === slides[current].title.split(' ').length - 1 ? (
                                                <span className="text-rose-300">{word}</span>
                                            ) : word}
                                        </span>
                                    ))}
                                </motion.h1>
                                <motion.p
                                    variants={itemVariants}
                                    className="text-base sm:text-lg md:text-xl text-white/80 font-medium mb-6 sm:mb-8 tracking-wide max-w-xl"
                                >
                                    {slides[current].subtitle}
                                </motion.p>
                                <motion.div variants={itemVariants} className="flex items-center gap-3 sm:gap-4">
                                    <button 
                                        onClick={() => navigate('/')}
                                        className="shimmer-btn btn-primary px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold tracking-wider inline-flex items-center gap-2.5 group"
                                    >
                                        Shop Now
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => navigate('/about')}
                                        className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-white border-2 border-white/25 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
                                    >
                                        Our Story
                                    </button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Floating Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="floating-badge right-4 sm:right-8 top-6 sm:top-10 animate-float hidden lg:flex"
            >
                <div className="w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center">
                    <Truck size={16} className="text-rose-400" />
                </div>
                <div>
                    <p className="text-xs font-black text-gray-900 leading-none">Free Shipping</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">On all orders</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="floating-badge right-4 sm:right-8 top-24 sm:top-28 animate-float-delay hidden lg:flex"
            >
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                    <Leaf size={16} className="text-green-500" />
                </div>
                <div>
                    <p className="text-xs font-black text-gray-900 leading-none">Pure Cotton</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">100% Bio-washed</p>
                </div>
            </motion.div>

            {/* Prev/Next Controls */}
            <button
                onClick={goPrev}
                className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all border border-white/10 hover:border-white/25"
            >
                <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <button
                onClick={goNext}
                className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/25 hover:scale-110 transition-all border border-white/10 hover:border-white/25"
            >
                <ChevronRight size={22} strokeWidth={2.5} />
            </button>

            {/* ─── Pagination: Glass Pill with Progress ─── */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className="relative"
                        >
                            <div className={`rounded-full transition-all duration-500 ${current === index
                                ? 'w-8 h-2 bg-white shadow-lg'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                            }`} />
                            {/* Progress bar overlay on active dot */}
                            {current === index && (
                                <div className="absolute inset-0 rounded-full overflow-hidden">
                                    <div
                                        key={progressKey}
                                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-progress"
                                    />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
