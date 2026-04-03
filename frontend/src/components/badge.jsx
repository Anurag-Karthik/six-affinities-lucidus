export default function Badge({ text, color }) {
    const colors = {
        orange: 'bg-linear-to-b from-light-orange to-dark-orange text-white',
        'yellow': 'bg-linear-to-b from-light-yellow to-dark-yellow text-white',
        'green': 'bg-linear-to-b from-light-green to-dark-green text-white'
    }

    return (
        <div className={`p-2 rounded-4xl leading-none text-sm ${colors[color]}`}>
            {text}
        </div>
    );
}