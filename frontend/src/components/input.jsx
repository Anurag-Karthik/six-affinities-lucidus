import { useId } from "react";

export default function Input({
    id,
    label,
    placeholder,
    value,
    onChange,
    className = "",
    error,
    type = "text",
    name,
    disabled,
    required,
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    return (
        <div className={`w-full  min-h-24 ${className}`}>
            <div className="relative">
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    placeholder={placeholder || " "}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    className={`peer w-full px-3 py-3.5 text-lg text-black bg-white border rounded-xl outline-none transition-all duration-200 placeholder:opacity-0 focus:placeholder:opacity-100 focus:placeholder:text-gray-400 ${hasError ? "border-red-500 focus:border-red-500" : "border-olive-green focus:border-olive-green"}`}
                />

                {label && (
                    <label
                        htmlFor={inputId}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 px-1 pointer-events-none transition-all duration-200 peer-focus:-top-5 peer-focus:translate-y-0 peer-focus:text-xs peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs ${hasError ? "text-red-600 peer-focus:text-red-600 peer-not-placeholder-shown:text-red-600" : "text-gray-500 peer-focus:text-olive-green peer-not-placeholder-shown:text-olive-green"}`}
                    >
                        {label}
                    </label>
                )}
            </div>

            {hasError && <p className="mt-1 text-sm text-red-600 text-left">{error}</p>}
        </div>
    );
}