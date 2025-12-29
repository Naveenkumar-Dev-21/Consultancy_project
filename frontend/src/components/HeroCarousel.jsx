import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop",
        title: "Summer Collection",
        subtitle: "New arrivals for your little sunshine.",
        color: "from-orange-400/80 to-pink-400/80"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1522771753035-4a5046306063?q=80&w=2070&auto=format&fit=crop",
        title: "Cozy Comfort",
        subtitle: "Softest fabrics for sensitive skin.",
        color: "from-blue-400/80 to-purple-400/80"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1560505163-718274158227?q=80&w=2070&auto=format&fit=crop",
        title: "Playtime Essentials",
        subtitle: "Durable and stylish for every adventure.",
        color: "from-green-400/80 to-teal-400/80"
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
        <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <div className="w-full h-full relative">
                        <img
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover"
                        />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].color}`} />

                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-10 opacity-20">
                            <Sparkles size={80} className="text-white animate-pulse" />
                        </div>
                        <div className="absolute bottom-20 left-10 opacity-10">
                            <Sparkles size={60} className="text-white animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                            <div className="max-w-3xl px-6">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                                >
                                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                                        {slides[current].title}
                                    </h1>
                                    <p className="text-lg md:text-2xl text-white/95 font-medium drop-shadow-md mb-6">
                                        {slides[current].subtitle}
                                    </p>
                                    <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-bold text-sm hover:bg-pink-50 hover:scale-105 transition-all duration-300 shadow-xl">
                                        Shop Now
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
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md text-white transition-all z-10 hover:scale-110"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md text-white transition-all z-10 hover:scale-110"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2.5 rounded-full transition-all ${current === index ? "bg-white w-8" : "bg-white/50 w-2.5"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
