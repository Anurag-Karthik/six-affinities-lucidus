import { RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis, Legend, PolarGrid } from 'recharts';

export default function HexagonChart({ data }) {
    const chartData = data.map((item, index) => ({
        label: item.label || `Item ${index + 1}`,
        value: Number(item.value) || 0,
        image_url: item.image_url || "",
    }));

    return (
        <div className="w-45.5">
            <div className="relative h-45.5">
                <RadarChart responsive data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="label" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                        <Radar
                            name="Results"
                            dataKey="value"
                            stroke="##FFFFFF"
                            fill="#FF9A64CC"
                            fillOpacity={0.8}
                            isAnimationActive={false}
                        />
                    <Legend />
                </RadarChart>
            </div>
        </div>
    );
}
