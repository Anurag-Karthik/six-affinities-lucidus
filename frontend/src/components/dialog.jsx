import Button from './button';

export default function Dialog({ children, displayDialog, isClosable, onClose }) {
    return (
        <div>
            {
                displayDialog &&
            <div className='z-100 h-screen w-screen text-center fixed inset-0 bg-white/5 backdrop-blur-lg'>
                    <div className='max-w-90 fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-t-3xl p-6 pb-14 text-center bg-linear-to-b from-white/80 to-white'>
                        {
                            isClosable &&
                            <div className='text-right pb-2'>
                                <Button onClick={onClose} className='text-olive-green'>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </Button>
                            </div>
                        }
                        { children }
                    </div>
                </div>
            }
        </div>
    );
}