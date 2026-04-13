import { RadarChart, Radar, PolarAngleAxis, PolarGrid, ResponsiveContainer } from 'recharts';

const renderAxisTick = ({ x, y, payload, cx, cy }) => {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return null;
    }

    const size = 24;
    const gap = 12;
    const imageSrc = new URL(`../assets/images/affinity-icons/${String(payload?.value || '').toLowerCase()}.svg`, import.meta.url).href;

    let drawX = x;
    let drawY = y;

    if (typeof cx === 'number' && typeof cy === 'number') {
        const dx = x - cx;
        const dy = y - cy;
        const length = Math.hypot(dx, dy);

        if (length > 0) {
            drawX = x + (dx / length) * gap;
            drawY = y + (dy / length) * gap;
        }
    }

    if (!imageSrc) {
        return null;
    }

    return (
        <g>
            <image
                x={drawX - size / 2}
                y={drawY - size / 2}
                width={size}
                height={size}
                href={imageSrc}
                preserveAspectRatio="xMidYMid meet"
            />
        </g>
    );
};

// #endregion
export default function RadialChart({ chartData }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: 240 }}>
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '185px',
                    height: '78%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart responsive data={chartData}>
                    <PolarGrid radialLines={false} />
                    <PolarAngleAxis dataKey="code" tick={renderAxisTick} />
                    <Radar
                        name="Results"
                        dataKey="probability"
                        stroke="#FF9A64CC"
                        fill="#FF9A64CC"
                        fillOpacity={1}
                        isAnimationActive={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}