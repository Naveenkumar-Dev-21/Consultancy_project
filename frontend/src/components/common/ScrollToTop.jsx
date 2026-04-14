import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 320);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = () => {
        setSpinning(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSpinning(false), 600);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    id="scroll-to-top-btn"
                    aria-label="Scroll to top"
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={handleClick}
                    className="scroll-to-top-fab"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.88 }}
                >
                    <motion.div
                        animate={{ rotate: spinning ? 360 : 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                        <ArrowUp size={20} strokeWidth={2.5} />
                    </motion.div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
