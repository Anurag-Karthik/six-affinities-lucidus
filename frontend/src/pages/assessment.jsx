import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useDraggable,
  useDroppable,
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";

import Button from "../components/button";
import Header from "../components/header";
import ProgressBar from "../components/progress-bar";
import Dialog from "../components/dialog";
import Badge from "../components/badge";
import environment from "../environment";

import undo from "../assets/images/icons/undo.svg";
import arrow from "../assets/images/icons/arrow_forward.svg";
import CloseButton from "../components/close-btn";

export default function Assessment() {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const [isTutorialActive, setIsTutorialActive] = useState(true);
  const [
    leaveAssessmentConfirmationDialog,
    setLeaveAssessmentConfirmationDialog,
  ] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startExitAnimation, setStartExitAnimation] = useState({
    status: 'dragging',
    response: null,
  });
  const [exitAnimationEnded, setExitAnimationEnded] = useState(false);
  const [questionSet, setQuestionSet] = useState([]);
  const [assessmentError, setAssessmentError] = useState("");

  useEffect(() => {
    const fetchAssessmentQuestions = async () => {
      try {
        const userToken = localStorage.getItem("six-affinities-user-token");

        if (!userToken) {
          setAssessmentError("Please login to start the assessment.");
          navigate("/");
          return;
        }

        if (!assessmentId) {
          setAssessmentError("Assessment id is missing.");
          navigate("/");
          return;
        }

        setQuestionSet([]);
        setCurrentQuestionIndex(0);
        setProgress(0);
        setStartExitAnimation({ status: 'dragging', response: null });
        setExitAnimationEnded(false);
        setIsTutorialActive(true);

        const assessmentResponse = await fetch(
          `${environment.backendUrl}/assessments/get-assessment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ assessmentId }),
          },
        );

        if (!assessmentResponse.ok) {
          if (assessmentResponse.status === 401) {
            setAssessmentError("Your session has expired. Please login again.");
            localStorage.clear();
            navigate("/");
            return;
          }

          throw new Error("Failed to load assessment data. Please try again.");
        }

        const assessmentData = await assessmentResponse.json();

        if (!assessmentData?.success) {
          throw new Error(
            assessmentData?.data?.message || "Failed to load assessment data.",
          );
        }

        const savedResponses = assessmentData?.data?.assessment?.responses || [];
        const resumeQuestionIndex = savedResponses.length;

        const response = await fetch(
          `${environment.backendUrl}/assessments/fetch-assessment-questions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({ assessmentId }),
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            setAssessmentError("Your session has expired. Please login again.");
            localStorage.clear();
            navigate("/");
            return;
          }

          throw new Error("Failed to fetch assessment questions. Please try again.");
        }

        const data = await response.json();

        if (!data?.success) {
          throw new Error(
            data?.data?.message || "Failed to fetch assessment questions.",
          );
        }

        const returnedQuestions = data?.data?.questions || [];
        if (!returnedQuestions.length) {
          throw new Error("No assessment questions were returned.");
        }

        setQuestionSet(returnedQuestions);
        const nextQuestionIndex = Math.min(
          resumeQuestionIndex,
          Math.max(returnedQuestions.length - 1, 0),
        );
        setCurrentQuestionIndex(nextQuestionIndex);
        setProgress(Math.round((nextQuestionIndex / returnedQuestions.length) * 100));
        setIsTutorialActive(resumeQuestionIndex === 0);
        setAssessmentError("");
      } catch (error) {
        console.error("Fetch Assessment Questions Error:", error);
        setAssessmentError(
          error.message || "Failed to load assessment questions.",
        );
      }
    };

    fetchAssessmentQuestions();
  }, [assessmentId, navigate]);

  useEffect(() => {
    const handleBrowserBack = () => {
      setLeaveAssessmentConfirmationDialog(true);
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBrowserBack);

    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);

  useEffect(() => {
    if (!exitAnimationEnded) return;

    setStartExitAnimation({ status: 'dragging', response: null });
    setExitAnimationEnded(false);

    const isLastQuestion = currentQuestionIndex === questionSet.length - 1;

    if (isLastQuestion) {
      navigate(`/result/${assessmentId}`);
    } else {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      updateProgress(newIndex);
    }
  }, [exitAnimationEnded]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // prevents accidental taps
        tolerance: 5, // movement threshold
      },
    }),
  );

  const startAssessment = () => {
    setCurrentQuestionIndex(0);
    setIsTutorialActive(false);
  };

  const leaveAssessmentHandler = () => {
    if (leaveAssessmentConfirmationDialog || isTutorialActive) {
      navigate("/");
    } else {
      setLeaveAssessmentConfirmationDialog(true);
    }
  };

  const updateProgress = (index) => {
    if (!questionSet.length) {
      setProgress(0);
      return;
    }
    setProgress(Math.round((index / questionSet.length) * 100));
  };

  const handleUndo = () => {
    const newIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(newIndex);
    updateProgress(newIndex);
  };

  const handleResponseSubmission = async (userResponse) => {
    try {
      const userToken = localStorage.getItem("six-affinities-user-token");
      const currentQuestion = questionSet[currentQuestionIndex];
      const isLastQuestion = currentQuestionIndex === questionSet.length - 1;

      if (!userToken || !assessmentId || !currentQuestion?.id) {
        throw new Error(
          "Missing assessment context. Please restart the assessment.",
        );
      }

      const responseValueMap = {
        yes: "YES",
        no: "NO",
        maybe: "MAYBE",
      };

      const responseValue = responseValueMap[userResponse];

      if (!responseValue) {
        throw new Error("Invalid response selected.");
      }

      const endpoint = isLastQuestion
        ? "complete-assessment"
        : "record-response";

      const response = await fetch(
        `${environment.backendUrl}/assessments/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            assignmentId: assessmentId,
            questionId: currentQuestion.id,
            response: responseValue,
          }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          setAssessmentError("Your session has expired. Please login again.");
          localStorage.clear();
          navigate("/");
        }
        throw new Error("Failed to save response. Please try again.");
      }

      const apiResponseData = await response.json();

      if (!apiResponseData?.success) {
        throw new Error(
          apiResponseData?.data?.message || "Failed to save response.",
        );
      }
    } catch (error) {
      console.error("Record Response Error:", error);
      setAssessmentError(
        error.message || "Failed to save response. Please try again.",
      );
      setStartExitAnimation({ status: 'dragging', response: null });
    }
  };

  return (
    <div className="relative h-screen">
      <Header handleBackNavInAssessment={leaveAssessmentHandler} />

      {isTutorialActive && (
        <Tutorial
          onClose={leaveAssessmentHandler}
          onStartAssessment={startAssessment}
        />
      )}

      {!isTutorialActive && (
        <>
          <DndContext
            onDragEnd={(event) => {
              const { over } = event;

              if (!over) return;

              const id = over.id;

              if (["no", "maybe", "yes"].includes(id)) {
                setStartExitAnimation({
                  status: 'above-badge',
                  response: id.toUpperCase(),
                });
                handleResponseSubmission(id);
              }
            }}
            sensors={sensors}
          >
            <div className="px-6 text-center">
              <CloseButton onClose={leaveAssessmentHandler} />

              <ProgressBar progress={progress} />

              {assessmentError && (
                <p className="mt-4 text-sm text-red-500">{assessmentError}</p>
              )}

              {!assessmentError && (
                <AssessmentBoard
                  questionSet={questionSet}
                  currentQuestionIndex={currentQuestionIndex}
                  onUndo={handleUndo}
                  startExitAnimation={startExitAnimation}
                  exitAnimationPauseEnded={() => setStartExitAnimation({ status: 'exit', response: startExitAnimation.response })}
                  exitAnimationEnded={() => setExitAnimationEnded(true)}
                />
              )}
            </div>
          </DndContext>

          <Dialog
            displayDialog={leaveAssessmentConfirmationDialog}
            isClosable={true}
            onClose={() => setLeaveAssessmentConfirmationDialog(false)}
          >
            <div className="text-purple text-lg font-semibold pb-2">
              Almost there...
            </div>
            <div className="text-purple pb-5">
              You’re just a few cards away from unlocking career insights.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={leaveAssessmentHandler}
                className="rounded-xl py-4"
                type="olive-green-light"
              >
                Exit Quest
              </Button>
              <Button
                onClick={() => setLeaveAssessmentConfirmationDialog(false)}
                className="rounded-xl py-4"
                type="olive-green"
              >
                Continue
              </Button>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}

function AssessmentBoard({
  questionSet,
  currentQuestionIndex,
  onUndo,
  startExitAnimation,
  exitAnimationPauseEnded,
  exitAnimationEnded,
}) {
  const {
    attributes,
    listeners,
    setNodeRef: affinityCardDraggableRef,
    transform,
  } = useDraggable({
    id: "affinity-card",
  });
  const { setNodeRef: noResponseDroppableRef } = useDroppable({
    id: "no",
  });
  const { setNodeRef: maybeResponseDroppableRef } = useDroppable({
    id: "maybe",
  });
  const { setNodeRef: yesResponseDroppableRef } = useDroppable({
    id: "yes",
  });

  // To inform the Parent that Animation has ended and it's safe to move to next question or result page
  useEffect(() => {
    if (startExitAnimation.status === 'above-badge') {
      const moveCardToBadgeTimer = setTimeout(() => {
        exitAnimationPauseEnded();
      }, 10);

      return () => clearTimeout(moveCardToBadgeTimer);
    } else if (startExitAnimation.status === 'exit') {
      const endExitAnimationTimer = setTimeout(() => {
        exitAnimationEnded();
      }, 500);

      return () => clearTimeout(endExitAnimationTimer);
    }
  }, [startExitAnimation]);

  const getAnimation = () => {
    if (startExitAnimation.status === 'dragging') {
        return {
            transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform ? (transform.y > 0 ? Math.max(0.25, 1 - Math.abs(transform.y) / (window.innerHeight * 0.25)) : 1) : 1})`
            : undefined,
            transition: "transform 200ms ease",
        };
    } if (startExitAnimation.status === 'exit') {
      // Once release the card, trigger the exit animation based on the response
      switch (startExitAnimation.response) {
        case "YES":
          return {
            transform: `translate3d(37%, 100vh, 0) scale(0.25)`,
            transition: "transform 1s ease-out",
          };
        case "NO":
          return {
            transform: `translate3d(-37%, 100vh, 0) scale(0.25)`,
            transition: "transform 1s ease-out",
          };
        case "MAYBE":
          return {
            transform: `translate3d(0, 100vh, 0) scale(0.25)`,
            transition: "transform 1s ease-out",
          };
      }
    } else if(startExitAnimation.status === 'above-badge') {
        switch (startExitAnimation.response) {
            case "YES":
            return {
                transform: `translate3d(37%, 230px, 0) scale(0.25)`,
                transition: 'none',
            };
            case "NO":
            return {
                transform: `translate3d(-37%, 230px, 0) scale(0.25)`,
                transition: 'none',
            };
            case "MAYBE":
            return {
                transform: `translate3d(0, 230px, 0) scale(0.25)`,
                transition: 'none',
            };
        }
    }
  };

  if (!questionSet.length) {
    return <div className="my-10 text-light-violet">Loading questions...</div>;
  }

  return (
    <>
      <div className="my-4 text-lg font-bold text-light-violet">
        Would You Like To...
      </div>

      <div
        ref={affinityCardDraggableRef}
        {...listeners}
        {...attributes}
        className="bg-indigo p-6 rounded-3xl text-center"
        style={getAnimation()}
      >
        <img
          src={questionSet[currentQuestionIndex]?.imageUrl}
          alt="Question"
          className="mx-auto"
        />
        <div className="text-white text-lg font-bold pt-4">
          {questionSet[currentQuestionIndex]?.statement}?
        </div>
      </div>

      <div className="min-h-12">
        {currentQuestionIndex > 0 && (
          <Button
            onClick={onUndo}
            className="my-3 rounded-4xl px-3.5 py-2"
            type="blurred"
          >
            <div className="flex items-center">
              <img src={undo} className="mr-2" alt="Undo" />
              Undo
            </div>
          </Button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0  px-6 grid grid-cols-3 gap-8">
        <div ref={noResponseDroppableRef} className="h-80 flex items-end">
          <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
            <Badge text="No" color="orange"></Badge>
          </div>
        </div>
        <div ref={maybeResponseDroppableRef} className="h-80 flex items-end">
          <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
            <Badge text="Maybe" color="yellow"></Badge>
          </div>
        </div>
        <div ref={yesResponseDroppableRef} className="h-80 flex items-end">
          <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
            <Badge text="Yes" color="green"></Badge>
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
          transition: "transform 200ms ease-out",
        };

      case "dragging":
        return {
          transform: `translate3d(-37%, 200px, 0) scale(0.25)`,
          transition: "transform 1s ease-out",
        };
      case "exit":
        return {
          transform: `translate3d(-37%, 100vh, 0) scale(0.25)`,
          transition: "transform 2s ease-in-out",
        };
      case "reset":
        return {
          transform: "translate3d(0px, 0px, 0) scale(1)",
          transition: "none",
        };
    }
  };

  useEffect(() => {
    let resetTimer;
    let initialTimer;
    let dragTimer;
    let pauseTimer;
    let exitTimer;

    const runAnimation = () => {
      setPhase("reset");

      resetTimer = setTimeout(() => {
        setPhase("initial");

        initialTimer = setTimeout(() => {
          setPhase("dragging");

          dragTimer = setTimeout(() => {
            pauseTimer = setTimeout(() => {
              setPhase("exit");

              exitTimer = setTimeout(() => {
                runAnimation();
              }, 2000);
            }, 500);
          }, 1000);
        }, 200);
      }, 50);
    };

    runAnimation();

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(initialTimer);
      clearTimeout(dragTimer);
      clearTimeout(pauseTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div className="px-6 text-center">
      <CloseButton onClose={onClose} />

      <div className="text-sm text-light-violet mb-4">
        <span className="font-bold">Instructions:</span>
        <span> Drag and drop the card.</span>
      </div>

      <div
        className="bg-indigo p-6 rounded-3xl text-center z-10"
        style={getAnimation()}
      >
        <div className="w-full h-50 mb-4 bg-[#5E35F1] rounded-3xl"></div>
        <div className="w-full h-7 mb-2 bg-[#5E35F1] rounded-xl"></div>
        <div className="w-[80%] h-7 mx-auto bg-[#5E35F1] rounded-xl"></div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-6 grid grid-cols-3 gap-8">
        <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
          <Badge text="No" color="orange"></Badge>
        </div>
        <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
          <Badge text="Maybe" color="yellow"></Badge>
        </div>
        <div className="w-full h-40 px-1 bg-[#2C167A80] rounded-t-4xl">
          <Badge text="Yes" color="green"></Badge>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 text-center mb-16 z-10">
        <Button
          onClick={onStartAssessment}
          className="rounded-4xl font-bold text-sm"
          type="olive-green"
        >
          <div className="flex items-center ml-2">
            Let's Go
            <img src={arrow} className="ml-2" alt="Arrow" />
          </div>
        </Button>
      </div>
    </div>
  );
}
