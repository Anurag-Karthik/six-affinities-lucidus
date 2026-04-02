import { useNavigate } from "react-router-dom";

import Button from "../components/button";

import arrow from "../assets/images/arrow_forward.svg";

export default function Landing() {
    const navigate = useNavigate();
    
    const startQuestBtnHandler = () => {
        navigate("/assessment");
    }

    return (
        <div className="text-center">
            <div className="mt-25 text-xl/relaxed text-white font-bold">
                <div>Ready To Discover Your</div>
                <div>Six Affinities?<sup className="text-xs">TM</sup></div>
            </div>
            <div className="mt-109">
                <Button onClick={startQuestBtnHandler} className='rounded-4xl font-bold text-sm' type="olive-green">
                    <div className="flex items-center">
                        Start Quest
                        <img src={arrow} className="ml-2" alt="Arrow" />
                    </div>
                </Button>
            </div>
        </div>
    )
}