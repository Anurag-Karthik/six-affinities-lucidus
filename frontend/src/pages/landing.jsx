import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Button from "../components/button";
import Header from "../components/header";
import Dialog from "../components/dialog";
import Input from "../components/input";

import arrow from "../assets/images/icons/arrow_forward.svg";
import builder from "../assets/images/affinity-icons/builder.svg";
import creator from "../assets/images/affinity-icons/creator.svg";
import helper from "../assets/images/affinity-icons/helper.svg";
import leader from "../assets/images/affinity-icons/leader.svg";
import organizer from "../assets/images/affinity-icons/organizer.svg";
import thinker from "../assets/images/affinity-icons/thinker.svg";
import environment from "../environment";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AFFINITY_ICONS = [organizer, leader, helper, builder, creator, thinker];

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialog, setLoginDialog] = useState(false);
  const [isRegistration, setIsRegistration] = useState(false);
  const [newOrExistingAssessmentPrompt, setNewOrExistingAssessmentPrompt] = useState(false);
  const [existingAssessmentToContinue, setExistingAssessmentToContinue] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  useEffect(() => {
    const userToken = localStorage.getItem("six-affinities-user-token");
    if (userToken) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const carouselTimer = setInterval(() => {
      setActiveCarouselIndex((prev) => (prev + 1) % AFFINITY_ICONS.length);
    }, 2200);

    return () => clearInterval(carouselTimer);
  }, []);

  const handleSessionExpired = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setLoginDialog(false);
    setNewOrExistingAssessmentPrompt(false);
    setExistingAssessmentToContinue(null);
    setLoginError("");
    navigate("/");
  };

  const closeAssessmentChoiceDialog = () => {
    setNewOrExistingAssessmentPrompt(false);
    setExistingAssessmentToContinue(null);
  };

  const createAssessment = async (userToken) => {
    const response = await fetch(`${environment.backendUrl}/assessments/create-assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleSessionExpired();
        return null;
      }

      throw new Error("Failed to create assessment. Please try again.");
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.data?.message || "Failed to create assessment.");
    }

    const createdAssessmentId = data?.data?.assessmentId || data?.assessmentId;
    if (!createdAssessmentId) {
      throw new Error("Assessment id was not returned.");
    }

    return createdAssessmentId;
  };

  const getExistingAssessment = async (userToken) => {
    const response = await fetch(`${environment.backendUrl}/assessments/get-existing-assessments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleSessionExpired();
        return null;
      }

      throw new Error("Failed to fetch existing assessments.");
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.data?.message || "Failed to fetch existing assessments.");
    }

    return data?.data?.assessments?.[0] || null;
  };
  
  const navigateToAssessment = async (userToken, existingAssessment = null) => {
    const assessmentId = existingAssessment?.id || (await createAssessment(userToken));
    if (!assessmentId) {
      return;
    }

    navigate(`/assessment/${assessmentId}`);
  };

  const handleContinueExistingQuest = async () => {
    if (!existingAssessmentToContinue?.id) {
      closeAssessmentChoiceDialog();
      return;
    }

    closeAssessmentChoiceDialog();
    navigate(`/assessment/${existingAssessmentToContinue.id}`);
  };

  const handleStartNewQuest = async () => {
    try {
      const userToken = localStorage.getItem("six-affinities-user-token");

      if (!userToken) {
        handleSessionExpired();
        return;
      }

      closeAssessmentChoiceDialog();
      await navigateToAssessment(userToken);
    } catch (error) {
      console.error("Start New Quest Error:", error);
      setLoginError(error.message || "Failed to start a new quest.");
      setLoginDialog(true);
    }
  };

  const startQuestBtnHandler = async () => {
    if (!isAuthenticated) {
      setLoginDialog(true);
      return;
    }

    try {
      const userToken = localStorage.getItem("six-affinities-user-token");

      if (!userToken) {
        setIsAuthenticated(false);
        setLoginDialog(true);
        return;
      }

      const existingAssessment = await getExistingAssessment(userToken);

      if (existingAssessment?.id) {
        setExistingAssessmentToContinue(existingAssessment);
        setNewOrExistingAssessmentPrompt(true);
        return;
      }

      await navigateToAssessment(userToken);
    } catch (error) {
      console.error("Start Quest Error:", error);
      setLoginError(error.message || "Failed to start assessment.");
      setLoginDialog(true);
    }
  };

  const emailChangeHandler = (event) => {
    const value = event.target.value;
    setEmail(value);
    if (
      emailError &&
      EMAIL_REGEX.test(value.trim()) &&
      value.trim().length > 0
    ) {
      setEmailError("");
    }
  };

  const passwordChangeHandler = (event) => {
    const value = event.target.value;
    setPassword(value);
    if (passwordError && value.trim().length > 0) {
      setPasswordError("");
    }
  };

  const nameChangeHandler = (event) => {
    const value = event.target.value;
    setName(value);
    if (nameError && value.trim().length > 0) {
      setNameError("");
    }
  };

  const authenticateUser = async (mode) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    let hasError = false;

    if (mode === "register") {
      if (!trimmedName) {
        setNameError("Name is required");
        hasError = true;
      } else {
        setNameError("");
      }
    }

    if (!trimmedEmail) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Invalid Email");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!trimmedPassword) {
      setPasswordError("Password is required");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) {
      return;
    }

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setLoginError("");

    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const payload =
      mode === "register"
        ? {
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword,
          }
        : {
            email: trimmedEmail,
            password: trimmedPassword,
          };

    const failureMessage =
      mode === "register"
        ? "Failed to Register. Please contact Administration."
        : "Failed to Login. Please contact Administration.";

    const invalidCredentialsMessage =
      mode === "login" ? "Invalid Email or Password" : failureMessage;

    try {
      const response = await fetch(`${environment.backendUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(invalidCredentialsMessage);
        }

        throw new Error(failureMessage);
      }

      const data = await response.json();
      const authData = data?.data ?? data;
      const accessToken = authData?.accessToken;
      const activeAssessment = authData?.activeAssessment || null;

      if (!accessToken) {
        throw new Error(failureMessage);
      }

      localStorage.setItem("six-affinities-user-token", accessToken);
      setIsAuthenticated(true);
      setLoginDialog(false);
      setName("");
      setEmail("");
      setPassword("");
      setIsRegistration(false);

      if (activeAssessment?.id) {
        setExistingAssessmentToContinue(activeAssessment);
        setNewOrExistingAssessmentPrompt(true);
        return;
      }

      await navigateToAssessment(accessToken);
    } catch (error) {
      console.error(`${mode === "register" ? "Registration" : "Login"} Error:`, error);
      setLoginError(error.message || failureMessage);
    }
  };

  return (
    <>
      <Header />

      <div className="text-center">
        <div className="mt-25 text-xl text-white font-bold">
          <div>Ready To Discover Your</div>
          <div>
            Six Affinities?<sup className="text-xs">TM</sup>
          </div>
        </div>
        <div className="relative mt-32 h-36 w-full overflow-hidden">
          <div className="relative mx-auto h-36 w-36">
            {AFFINITY_ICONS.map((icon, index) => {
              const totalSlides = AFFINITY_ICONS.length;
              const previousSlideIndex =
                (activeCarouselIndex - 1 + totalSlides) % totalSlides;

              const isActiveSlide = index === activeCarouselIndex;
              const isPreviousSlide = index === previousSlideIndex;

              return (
                <img
                  key={icon}
                  src={icon}
                  alt="Affinity Icon"
                  className="absolute top-0 left-0 w-36 transition-all duration-500 ease-in-out"
                  style={{
                    transform: isActiveSlide
                      ? "translateX(0%)"
                      : isPreviousSlide
                        ? "translateX(-130%)"
                        : "translateX(130%)",
                    opacity: isActiveSlide ? 1 : 0,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-40">
          <Button
            onClick={startQuestBtnHandler}
            className="rounded-4xl font-bold text-sm"
            type="olive-green"
          >
            <div className="flex items-center ml-2">
              Start Quest
              <img src={arrow} className="ml-2" alt="Arrow" />
            </div>
          </Button>
        </div>
      </div>

      <Dialog
        displayDialog={loginDialog}
        isClosable={true}
        onClose={() => setLoginDialog(false)}
      >
        <div className="text-purple text-lg font-semibold mb-2">
          {isRegistration ? "Welcome User!" : "Please Login to Continue"}
        </div>
        <div className="text-purple mb-5">
          {isRegistration
            ? "Create an account to start your Six Affinities Journey"
            : "Continue Exploring your Six Affinities"}
        </div>
        {isRegistration && (
          <Input
            label="Name"
            placeholder="Enter your name"
            name="name"
            value={name}
            onChange={nameChangeHandler}
            error={nameError}
            required={true}
          />
        )}
        <Input
          label="Email"
          placeholder="Enter your email"
          name="email"
          value={email}
          onChange={emailChangeHandler}
          error={emailError}
          required={true}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          name="password"
          type="password"
          value={password}
          onChange={passwordChangeHandler}
          error={passwordError}
          required={true}
        />
        <div className="text-right">
          {isRegistration ? (
            <Button
              onClick={() => authenticateUser("register")}
              className="w-[60%] rounded-xl py-4"
              type="olive-green"
            >
              Register
            </Button>
          ) : (
            <Button
              onClick={() => authenticateUser("login")}
              className="w-[60%] md:w-[25%] rounded-xl py-4"
              type="olive-green"
            >
              Login
            </Button>
          )}
        </div>
        <div>
          {loginError && (
            <p className="mt-6 text-sm text-red-600 text-center">
              {loginError}
            </p>
          )}
        </div>
        {
            isRegistration
            ? (
                <div className="mt-6 text-light-violet text-sm text-center">
                Already have an account? <span onClick={() => setIsRegistration(false)} className="text-olive-green hover:underline">
                    Login
                </span>
                </div>
            )
            : (
                <div className="mt-6 text-light-violet text-sm text-center">
                Don't have an account? <span onClick={() => setIsRegistration(true)} className="text-olive-green hover:underline">
                    Register
                </span>
                </div>
            ) 
        }
      </Dialog>

      <Dialog
        displayDialog={newOrExistingAssessmentPrompt}
        isClosable={false}
        onClose={closeAssessmentChoiceDialog}
      >
        <div className="text-purple text-lg font-semibold mb-2">
          Your Quest Awaits
        </div>
        <div className="text-purple mb-5">
          You’ve got ongoing quest. Continue your journey or begin a new one—it only takes a moment.
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleStartNewQuest}
            className="rounded-xl py-4"
            type="olive-green-light"
          >
            Start New
          </Button>
          <Button
            onClick={handleContinueExistingQuest}
            className="rounded-xl py-4"
            type="olive-green"
          >
            Continue
          </Button>
        </div>
      </Dialog>
    </>
  );
}
