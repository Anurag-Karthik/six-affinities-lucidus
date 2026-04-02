export default function Button({ children, onClick, className, type }) {
    const btnTypes = {
        "olive-green": 'bg-olive-green text-white',
        "olive-green-light": 'bg-white text-olive-green border-olive-green',
    }

    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-2 bg-secondary text-white rounded ${btnTypes[type]} ${className}`}
        >
            {children}
        </button>
    );
}