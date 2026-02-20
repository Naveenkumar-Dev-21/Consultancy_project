import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: "/Images/01.png",
        title: "Summer Collection",
        subtitle: "New arrivals for your little sunshine.",
        position: "70% center"
    },
    {
        id: 2,
        image: "/Images/02.png",
        title: "Cozy Comfort",
        subtitle: "Softest fabrics for sensitive skin.",
        position: "65% center"
    },
    {
        id: 3,
        image: "/Images/03.png",
        title: "Playtime Essentials",
        subtitle: "Durable and stylish for every adventure.",
        position: "60% center"
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
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight drop-shadow-lg">
                                        {slides[current].title}
                                    </h1>
                                    <p className="text-base sm:text-lg md:text-xl text-white/90 font-light mb-6 sm:mb-8 tracking-wide max-w-lg mx-auto">
                                        {slides[current].subtitle}
                                    </p>
                                    <button className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-8 sm:px-10 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold tracking-wide hover:from-rose-500 hover:to-pink-600 transition-all duration-300 shadow-xl shadow-rose-500/30 active:scale-95">
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
