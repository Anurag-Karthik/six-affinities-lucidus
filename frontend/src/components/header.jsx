import { useLocation, useNavigate } from 'react-router-dom';

import logo from '/src/assets/images/lucidus-ai-logo.png'
    
export default function Header({ handleBackNavInAssessment }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const homeNavigationBtnHandler = () => {
        if (pathname !== "/" && pathname !== "/assessment") {
            navigate("/");
        } else if (pathname === "/assessment") {
            handleBackNavInAssessment();
        }
    };

    return (
        <div className="w-full h-15 px-6 pt-[17px] pb-[11px] mb-5 text-left bg-primary">
            <img src={logo} onClick={homeNavigationBtnHandler} className='h-8 w-7' alt="Lucidus AI Logo" />
        </div>
    );
}