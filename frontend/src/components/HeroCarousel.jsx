import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop",
        title: "Summer Collection",
        subtitle: "New arrivals for your little sunshine.",
        color: "bg-orange-100"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1522771753035-4a5046306063?q=80&w=2070&auto=format&fit=crop",
        title: "Cozy Comfort",
        subtitle: "Softest fabrics for sensitive skin.",
        color: "bg-blue-100"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1560505163-718274158227?q=80&w=2070&auto=format&fit=crop",
        title: "Playtime Essentials",
        subtitle: "Durable and stylish for every adventure.",
        color: "bg-green-100"
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
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }} // Smoother transition
                    className="absolute inset-0"
                >
                    <div className={`w-full h-full relative`}>
                        <img
                            src={slides[current].image}
                            alt={slides[current].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center">
                            <div className="max-w-3xl px-6">
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-md">
                                    {slides[current].title}
                                </h1>
                                <p className="text-lg md:text-2xl text-white/90 font-medium drop-shadow-sm">
                                    {slides[current].subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all z-10"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all z-10"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${current === index ? "bg-white w-6" : "bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
