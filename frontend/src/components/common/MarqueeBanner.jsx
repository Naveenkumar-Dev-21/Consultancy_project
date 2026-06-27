import React from 'react';

const items = [
    '✨ Free Shipping on all orders',
    '🎁 New arrivals every week',
    '💯 100% Pure Bio-washed Cotton',
    '🌿 Safe & gentle for newborns',
    '⭐ Trusted by 10,000+ happy families',
    '🎀 Premium gifting options available',
    '🚚 Fast delivery across India',
    '💖 Handpicked with love, just for your little one',
];

const MarqueeBanner = () => {
    // Duplicate items for seamless loop
    const allItems = [...items, ...items];

    return (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 dark:from-rose-900/60 dark:via-pink-900/60 dark:to-violet-900/60 text-white py-3 overflow-hidden relative z-20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.2)]">
            <div className="marquee-wrapper">
                <div className="animate-marquee inline-flex items-center gap-0">
                    {allItems.map((item, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-black tracking-wide whitespace-nowrap text-white"
                        >
                            {item}
                            <span className="mx-6 text-white/60 text-xs">✦</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarqueeBanner;
