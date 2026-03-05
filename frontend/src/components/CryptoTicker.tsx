'use client';
import { C } from '@/lib/theme';

export default function CryptoTicker() {
    const cryptos = [
        { symbol: 'BTC', price: '64,850.21', change: 1.24 },
        { symbol: 'ETH', price: '3,450.12', change: -0.45 },
        { symbol: 'SOL', price: '145.67', change: 4.89 },
        { symbol: 'BNB', price: '580.45', change: 0.12 },
        { symbol: 'XRP', price: '0.62', change: -1.10 },
        { symbol: 'ADA', price: '0.45', change: 0.56 },
        { symbol: 'DOT', price: '7.89', change: -2.34 },
    ];

    return (
        <div style={{
            background: C.navyDeep,
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
            padding: '10px 0',
            fontSize: '0.75rem',
            color: C.white,
            position: 'absolute', // Absolute so it scrolls with the page
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            overflow: 'hidden',
            height: '36px'
        }}>
            <div className="marquee">
                <div className="marquee-content">
                    {[...cryptos, ...cryptos, ...cryptos].map((c, i) => (
                        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 25px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 800, color: C.yellow, marginRight: '6px' }}>{c.symbol}</span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>${c.price}</span>
                            <span style={{
                                marginLeft: '8px',
                                color: c.change >= 0 ? C.teal : '#FF5252',
                                fontWeight: 700, fontSize: '0.7rem'
                            }}>
                                {c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
