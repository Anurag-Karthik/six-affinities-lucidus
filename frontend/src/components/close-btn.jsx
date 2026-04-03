import Button from "./button";

export default function CloseButton({ onClose }) {
    return (
        <div className="mb-8 text-right">
            <Button onClick={onClose} className='rounded-full p-3' type='blurred'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Button>
        </div>
    );
}