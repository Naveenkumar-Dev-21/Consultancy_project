import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-rose-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div className="w-full h-full relative">
                        <img
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover"
                            style={{ objectPosition: slides[current].position }}
                        />

                        {/* Gradient overlay with pink tint */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                            <div className="max-w-4xl">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-8 tracking-tighter drop-shadow-2xl">
                                        {slides[current].title}
                                    </h1>
                                    <p className="text-lg sm:text-xl md:text-2xl text-white/95 font-medium mb-8 sm:mb-12 tracking-wide max-w-2xl mx-auto drop-shadow-md">
                                        {slides[current].subtitle}
                                    </p>
                                    <button className="btn-primary px-10 sm:px-14 py-4 sm:py-5 rounded-2xl text-sm sm:text-lg font-black uppercase tracking-[0.2em] shadow-2xl">
                                        Shop Collection
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
            >
                <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
            >
                <ChevronRight size={24} strokeWidth={2} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`rounded-full transition-all duration-300 ${current === index
                            ? "bg-gradient-to-r from-rose-400 to-pink-500 w-8 h-3 shadow-lg"
                            : "bg-white/50 w-3 h-3 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
