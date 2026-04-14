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
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white py-2.5 overflow-hidden relative z-20">
            <div className="marquee-wrapper">
                <div className="animate-marquee inline-flex items-center gap-0">
                    {allItems.map((item, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap"
                        >
                            {item}
                            <span className="mx-6 opacity-50 text-white/60">·</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarqueeBanner;
