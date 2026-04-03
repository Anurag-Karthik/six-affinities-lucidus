export default function Button({ children, onClick, className, type }) {
    const btnTypes = {
        "olive-green": 'px-3.5 py-2 bg-olive-green text-white',
        "olive-green-light": 'px-3.5 py-2 bg-white text-olive-green border border-olive-green',
        "blurred": "font-bold text-sm text-white bg-white/5 backdrop-blur-lg"
    }

    return (
        <button
            onClick={onClick}
            className={`${btnTypes[type]} ${className}`}
        >
            {children}
        </button>
    );
}