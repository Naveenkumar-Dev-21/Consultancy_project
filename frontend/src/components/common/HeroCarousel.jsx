import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Truck, Leaf } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: "/Images/Carousel/boy_linen_1.png",
        title: "The Linen Edit",
        subtitle: "Timeless, breathable linen for your little gentleman.",
        position: "center 20%"
    },
    {
        id: 2,
        image: "/Images/Carousel/boy_linen_2.png",
        title: "Garden Adventures",
        subtitle: "Soft-as-air sage linen rompers for outdoor play.",
        position: "75% 15%"
    },
    {
        id: 3,
        image: "/Images/Carousel/boy_linen_3.png",
        title: "Pure Comfort",
        subtitle: "Minimalist cream linen sets for cozy moments.",
        position: "center 25%"
    }
];

const SLIDE_INTERVAL = 5000;

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [progressKey, setProgressKey] = useState(0);

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
        visible: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } }
    };
    const itemVariants = {
        hidden: { y: 32, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-rose-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
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
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 6.5, ease: 'easeOut' }}
                        />

                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/25 to-transparent" />

                        {/* Content with stagger */}
                        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                            <motion.div
                                className="max-w-4xl"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div variants={itemVariants}>
                                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full mb-4 border border-white/30">
                                        New Collection
                                    </span>
                                </motion.div>
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 tracking-tighter drop-shadow-2xl"
                                >
                                    {slides[current].title}
                                </motion.h1>
                                <motion.p
                                    variants={itemVariants}
                                    className="text-lg sm:text-xl md:text-2xl text-white/95 font-medium mb-8 sm:mb-10 tracking-wide max-w-2xl mx-auto drop-shadow-md"
                                >
                                    {slides[current].subtitle}
                                </motion.p>
                                <motion.div variants={itemVariants}>
                                    <button className="shimmer-btn btn-primary px-10 sm:px-14 py-4 sm:py-5 rounded-2xl text-sm sm:text-lg font-black uppercase tracking-[0.2em] shadow-2xl inline-flex items-center gap-3">
                                        Shop Collection
                                        <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Floating Badges */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="floating-badge left-4 sm:left-8 top-6 sm:top-10 animate-float hidden sm:flex"
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="floating-badge right-4 sm:right-8 top-6 sm:top-10 animate-float-delay hidden sm:flex"
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
                className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all"
            >
                <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <button
                onClick={goNext}
                className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all"
            >
                <ChevronRight size={24} strokeWidth={2} />
            </button>

            {/* Pagination Dots + Progress */}
            <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                <div className="flex gap-2.5">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`rounded-full transition-all duration-300 ${current === index
                                ? "bg-gradient-to-r from-rose-400 to-pink-500 w-8 h-3 shadow-lg"
                                : "bg-white/50 w-3 h-3 hover:bg-white/70"
                            }`}
                        />
                    ))}
                </div>
                {/* Progress bar */}
                <div className="w-24 h-0.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                        key={progressKey}
                        className="h-full bg-white/80 rounded-full animate-progress"
                    />
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
