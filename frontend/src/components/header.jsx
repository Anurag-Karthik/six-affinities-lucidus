import logo from '/src/assets/images/lucidus-ai-logo.png'

export default function Header() {
    return (
        <div className="w-full h-15 px-6 pt-[17px] pb-[11px] mb-5 text-left bg-primary">
            <img src={logo} className='h-8 w-7' alt="Lucidus AI Logo" />
        </div>
    );
}