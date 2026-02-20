import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') onNavigate(-1);
        if (e.key === 'ArrowRight') onNavigate(1);
    }, [onClose, onNavigate]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [handleKeyDown]);

    if (!images || images.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
                <X size={28} />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                        className="absolute left-4 md:left-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                        className="absolute right-4 md:right-8 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            {/* Main Image */}
            <div 
                className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={images[currentIndex]} 
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                />
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
                    {currentIndex + 1} / {images.length}
                </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); onNavigate(idx - currentIndex); }}
                            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageLightbox;
