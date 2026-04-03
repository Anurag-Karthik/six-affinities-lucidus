import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Header from "../components/header";
import CloseButton from "../components/close-btn";
import Badge from "../components/badge";
import HexagonChart from "../components/hexagon-chart";
import environment from "../environment";

export default function Result() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [resultError, setResultError] = useState("");

    useEffect(() => {
        const fetchAssessmentResult = async () => {
            try {
                const userToken = localStorage.getItem("six-affinities-user-token");

                if (!userToken) {
                    throw new Error("Please login to view assessment results.");
                }

                if (!assessmentId) {
                    throw new Error("Assessment id is missing.");
                }

                const response = await fetch(`${environment.backendUrl}/assessments/fetch-result`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({ assessmentId }),
                });

                if (!response.ok) {
                    if(response.status === 401) {
                        setAssessmentError('Your session has expired. Please login again.');
                        localStorage.clear();
                        navigate('/');
                    }
                    throw new Error("Failed to fetch assessment result.");
                }

                const data = await response.json();

                if (!data?.success) {
                    throw new Error(data?.data?.message || "Failed to fetch assessment result.");
                }

                setResults(data?.data?.result || {});
                console.log("Fetched Results:", data?.data?.result);
                setResultError("");
            } catch (error) {
                console.error("Fetch Result Error:", error);
                setResultError(error.message || "Failed to load results.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessmentResult();
    }, [assessmentId]);

    const sortedResults = useMemo(() => {
        const entries = Object.entries(results);
        return entries.sort(([, a], [, b]) => Number(b) - Number(a));
    }, [results]);

    const chartData = useMemo(() => {
        const affinityOrder = [
            { label: "Builder", icon: "/src/assets/images/affinity-icons/builder.svg" },
            { label: "Thinker", icon: "/src/assets/images/affinity-icons/thinker.svg" },
            { label: "Creator", icon: "/src/assets/images/affinity-icons/creator.svg" },
            { label: "Helper", icon: "/src/assets/images/affinity-icons/helper.svg" },
            { label: "Leader", icon: "/src/assets/images/affinity-icons/leader.svg" },
            { label: "Organizer", icon: "/src/assets/images/affinity-icons/organizer.svg" },
        ];

        const resultLookup = Object.entries(results).reduce((accumulator, [key, value]) => {
            accumulator[key.toLowerCase()] = Number(value) || 0;
            return accumulator;
        }, {});

        return affinityOrder.map(({ label, icon }) => ({
            label,
            value: resultLookup[label.toLowerCase()] || 0,
            image_url: icon,
        }));
    }, [results]);

    return (
         <div className='relative h-screen'>
            <Header handleBackNavInAssessment={() => navigate("/")} />

            <div className="m-6">
                <CloseButton onClose={() => navigate("/")} />

                <div className='mt-4 p-5 pb-0 linear bg-linear-to-t from-white/1x to-white/10 rounded-t-3xl backdrop-blur-2xl'>
                    <div className="text-violet font-semibold text-[18px] mb-1">
                        The Six Affinities<sup className="text-xs">TM</sup>
                    </div>
                    <div className="mb-4">
                        Know what drives you. When your work aligns with your interests, motivation lasts.
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center h-96">
                            <div className="w-64 h-64 rounded-full border-4 border-white/20 border-t-violet animate-spin"></div>
                        </div>
                    )}

                    {!isLoading && resultError && (
                        <p className="text-sm text-red-400 text-center">{resultError}</p>
                    )}

                    {!isLoading && !resultError && (
                        <>
                            <div className="mb-6 flex justify-center">
                                <HexagonChart data={chartData} />
                            </div>

                            <div>
                                <div className="text-violet font-semibold text-[14px] mb-4">Detailed View</div>
                                {sortedResults.map(([code, probability]) => (
                                    <div key={code} className="flex justify-between items-center mb-2">
                                        <Badge text={code} hasImage={true} imgSrc={`/src/assets/images/affinity-icons/${code.toLowerCase()}.svg`} color="blur" />
                                        <Badge text={`${probability}%`} color="blur" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>

        </div>
    )
}