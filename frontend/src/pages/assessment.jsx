import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useDraggable, useDroppable, DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';

import Button from '../components/button';
import Header from '../components/header';
import ProgressBar from '../components/progress-bar';

import undo from '../assets/images/icons/undo.svg';
import arrow from "../assets/images/icons/arrow_forward.svg";
import { questions_set } from '../data';
import Badge from '../components/badge';

export default function Assessment() {
    const navigate = useNavigate();
    const [ isTutorialActive, setIsTutorialActive ] = useState(true);
    const [ leaveAssessmentConfirmationPopup, setLeaveAssessmentConfirmationPopup ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const [ currentQuestionIndex, setCurrentQuestionIndex ] = useState(0);
    const [ isExiting, setIsExiting ] = useState(false);
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
            delay: 100,   // prevents accidental taps
            tolerance: 5, // movement threshold
            },
        })
    );
    
    let userResponses = questions_set.map((question) => { return {code: question.code, sub_code: question.sub_code, response: null }; });

    const startAssessment = () => {
        console.log("Assessment Started");
        setCurrentQuestionIndex(0);
        setIsTutorialActive(false);
    }

    const leaveAssessmentHandler = () => {
        if(leaveAssessmentConfirmationPopup || isTutorialActive) {
            navigate("/");
        } else {
            setLeaveAssessmentConfirmationPopup(true);
        }
    }

    const updateProgress = (index) => {
        setProgress(Math.round(((index) / questions_set.length) * 100)); 
    }

    const handleUndo = () => {
        const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            updateProgress(newIndex);
    }
    
    const handleResponseSubmission = (response) => {
        if(currentQuestionIndex < questions_set.length - 1) {
            userResponses[currentQuestionIndex].response = response;
            const newIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(newIndex);
            updateProgress(newIndex);
        } else {
            navigate("/result");
        }
    }

    return (
        <div className='relative h-screen'>
            <Header handleBackNavInAssessment={leaveAssessmentHandler} />

            {
                isTutorialActive &&
                <Tutorial onClose={leaveAssessmentHandler} onStartAssessment={startAssessment} />
            }

            {
                !isTutorialActive &&
                <>
                    <DndContext
                        onDragEnd={(event) => {
                            const { over } = event;

                            if (!over) return;

                            const id = over.id;

                            if (["no", "maybe", "yes"].includes(id)) {
                                setIsExiting(true);
                                handleResponseSubmission(id);
                            }
                        }}

                        sensors={sensors}
                    >
                        <div className='px-6 text-center'>
                            <CloseAssessmentButton onClose={leaveAssessmentHandler} />

                            <ProgressBar progress={progress} />

                            <AssessmentBoard currentQuestionIndex={currentQuestionIndex} onUndo={handleUndo} isExiting={isExiting}/>
                        </div>
                    </DndContext>

                    <LeaveAssessmentConfirmationPopup 
                        displayLeaveAssessmentPopup={leaveAssessmentConfirmationPopup} 
                        onCancel={() => setLeaveAssessmentConfirmationPopup(false)} 
                        onConfirm={leaveAssessmentHandler} 
                    />
                </>
            }
        </div>
    )
}


function AssessmentBoard({ currentQuestionIndex, onUndo, isExiting }) {
    const { attributes, listeners, setNodeRef: affinityCardDraggableRef, transform } = useDraggable({
        id: 'affinity-card',
        disabled: isExiting
    });
    const { setNodeRef: noResponseDroppableRef } = useDroppable({
        id: 'no',
    });
    const { setNodeRef: maybeResponseDroppableRef } = useDroppable({
        id: 'maybe',
    });
    const { setNodeRef: yesResponseDroppableRef } = useDroppable({
        id: 'yes',
    });

    const maxY = window.innerHeight * 0.25;
    const scale = transform ? transform.y > 0 ? Math.max(0.25, 1 - Math.abs(transform.y) / maxY) : 1 : 1;

    let finalTransform = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${scale})` : undefined;

    if(isExiting) {
        finalTransform = `translate3d(0px, 100vh, 0) scale(0.25 )`;
    }

    const style = {
        transform: finalTransform,
        transition: isExiting ? 'transform 2s ease-out' : 'transform 200ms ease'
    };

    return (
        <>
            <div className='my-4 text-lg font-bold text-light-violet'>
                Would You Like To...
            </div>

            <div ref={affinityCardDraggableRef} {...listeners} {...attributes} className='bg-indigo p-6 rounded-3xl text-center' style={style} >
                <img src={questions_set[currentQuestionIndex].image} alt="Question" className='mx-auto'/>
                <div className='text-white text-lg font-bold pt-4'>
                    {questions_set[currentQuestionIndex].statement}?
                </div>
            </div>

            <div className='min-h-12'>
                {
                    currentQuestionIndex > 0 &&
                    <Button onClick={onUndo} className='my-3 rounded-4xl px-3.5 py-2' type='blurred'>
                        <div className="flex items-center">
                            <img src={undo} className="mr-2" alt="Undo" />
                            Undo
                        </div>
                    </Button>
                }
            </div>                  

            <div className='absolute inset-x-0 bottom-0  px-6 grid grid-cols-3 gap-8'>
                <div ref={noResponseDroppableRef}>
                    <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                        <Badge text='No' color='orange'></Badge>
                    </div>
                </div>
                <div ref={maybeResponseDroppableRef}>
                    <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                        <Badge text='Maybe' color='yellow'></Badge>
                    </div>
                </div>
                <div ref={yesResponseDroppableRef}>
                    <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                        <Badge text='Yes' color='green'></Badge>
                    </div>
                </div>
            </div>
        </>
    );
}

function Tutorial({ onClose, onStartAssessment }) {
    const [phase, setPhase] = useState("dragging");

    const getAnimation = () => {
        switch (phase) {
            case "initial":
                return {
                    transform: "translate3d(0px, 0px, 0) scale(0.8)",
                    transition: "transform 200ms ease-out"
                }

            case "dragging":
                return {
                    transform: `translate3d(-37%, 200px, 0) scale(0.25)`,
                    transition: "transform 2s ease-out"
                }
            case "exit":
                return {
                    transform: `translate3d(-37%, 100vh, 0) scale(0.25)`,
                    transition: "transform 3s ease-in-out"
                }
            case "reset":
                return {
                    transform: "translate3d(0px, 0px, 0) scale(1)",
                    transition: "none"
                }
        }
    }

    useEffect(() => {
        let initialTimer;
        let dragTimer;
        let exitTimer;
        let resetTimer;
        let pauseTimer;

        const runAnimation = () => {
            setPhase("reset");

            resetTimer = setTimeout(() => {
                setPhase("initial");

                initialTimer = setTimeout(() => {
                    setPhase("dragging");

                    pauseTimer = setTimeout(() => {
                        setPhase("exit");

                        exitTimer = setTimeout(() => {
                            runAnimation();
                        }, 2000);

                    }, 3000);
                }, 500);

            }, 50);
        };

        runAnimation();

        return () => {
            clearTimeout(dragTimer);
            clearTimeout(exitTimer);
            clearTimeout(resetTimer);
            clearTimeout(pauseTimer);
        };
    }, []);

    return (
        <div className='px-6 text-center'>
            <CloseAssessmentButton onClose={onClose} />

            <div className='text-sm text-light-violet mb-4'>
                <span className='font-bold'>Instructions:</span>
                <span> Drag and drop the card.</span>
            </div>

            <div className='bg-indigo p-6 rounded-3xl text-center z-10' style={getAnimation()} >
                <div className='w-full h-50 mb-4 bg-[#5E35F1] rounded-3xl'></div>
                <div className='w-full h-7 mb-2 bg-[#5E35F1] rounded-xl'></div>
                <div className='w-[80%] h-7 mx-auto bg-[#5E35F1] rounded-xl'></div>
            </div>

            <div className='absolute inset-x-0 bottom-0 px-6 grid grid-cols-3 gap-8'>
                <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                    <Badge text='No' color='orange'></Badge>
                </div>
                <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                    <Badge text='Maybe' color='yellow'></Badge>
                </div>
                <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
                    <Badge text='Yes' color='green'></Badge>
                </div>
            </div>

            <div className='absolute inset-x-0 bottom-0 text-center mb-16 z-10'>
                <Button onClick={onStartAssessment} className='rounded-4xl font-bold text-sm' type="olive-green">
                    <div className="flex items-center ml-2">
                        Let's Go
                        <img src={arrow} className="ml-2" alt="Arrow" />
                    </div>
                </Button>
            </div>
        </div>
    );
}

function CloseAssessmentButton({ onClose }) {
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

function LeaveAssessmentConfirmationPopup({ displayLeaveAssessmentPopup, onCancel, onConfirm }) {
    return (
        <div>
            {
                displayLeaveAssessmentPopup &&
                <div className='h-screen w-screen fixed inset-0 bg-white/5 backdrop-blur-lg'>
                    <div className='w-full fixed bottom-0 rounded-t-3xl p-6 text-center bg-linear-to-b from-white/80 to-white'>
                        <div className='text-right pb-2'>
                            <Button onClick={onCancel} className='text-olive-green'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Button>
                        </div>
                        <div className='text-purple text-lg font-semibold pb-2'>
                            Almost there...
                        </div>
                        <div className='text-purple pb-5'>  
                            You’re just a few cards away from unlocking career insights.
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <Button onClick={onConfirm} className='rounded-xl py-4' type="olive-green-light">
                                Exit Quest
                            </Button>
                            <Button onClick={onCancel} className='rounded-xl py-4' type="olive-green">
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}