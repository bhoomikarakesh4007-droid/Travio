import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTravelSession } from "../context/TravelSessionContext";
import { calculatePersonality } from "../services/personalityService";
import { STAGE1_QUESTIONS, getAdaptiveQuestions } from "../services/exploreService";
import { calculateDestinationMatches } from "../services/matchingService";
import "../styles/PreferencesPage.css";

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { setRecommendations, setRecommendationMessage, setTravelerPersonality } = useTravelSession();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1); // 1 to 10
  const [answers, setAnswers] = useState({}); // Stores all Q1-Q10 answers
  const [stage2Questions, setStage2Questions] = useState([]);
  
  // Loading states
  const [isGeneratingStage2, setIsGeneratingStage2] = useState(false);
  const [isPlanningTrip, setIsPlanningTrip] = useState(false);

  // Auto-scrolling to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, isGeneratingStage2, isPlanningTrip]);

  // Detect user country via Geolocation + Timezone fallback
  useEffect(() => {
    const getCountryFromCoordinates = (lat, lng) => {
      if (lat >= 8.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0) return "India";
      if (lat >= -44.0 && lat <= -10.0 && lng >= 112.0 && lng <= 154.0) return "Australia";
      if (lat >= 24.0 && lat <= 46.0 && lng >= 122.0 && lng <= 146.0) return "Japan";
      if (lat >= 41.0 && lat <= 83.0 && lng >= -141.0 && lng <= -52.0) return "Canada";
      if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) return "United States";
      if (lat >= 35.0 && lat <= 70.0 && lng >= -10.0 && lng <= 40.0) return "Europe";
      return null;
    };

    const getCountryFromTimezone = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Calcutta") || tz.includes("Kolkata")) return "India";
        if (tz.includes("Australia") || tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane") || tz.includes("Perth") || tz.includes("Adelaide") || tz.includes("Hobart") || tz.includes("Darwin")) return "Australia";
        if (tz.includes("Tokyo")) return "Japan";
        if (tz.includes("Seoul")) return "South Korea";
        if (tz.includes("Europe")) return "Europe";
        if (tz.includes("America")) {
          if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Montreal") || tz.includes("Winnipeg")) return "Canada";
          return "United States";
        }
      } catch (e) {}
      return null;
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const country = getCountryFromCoordinates(latitude, longitude) || getCountryFromTimezone();
          if (country) {
            setAnswers((prev) => ({ ...prev, userLocationCountry: country }));
          }
        },
        (error) => {
          console.log("Location permission denied or failed, falling back to timezone", error);
          const country = getCountryFromTimezone();
          if (country) {
            setAnswers((prev) => ({ ...prev, userLocationCountry: country }));
          }
        },
        { timeout: 5000 }
      );
    } else {
      const country = getCountryFromTimezone();
      if (country) {
        setAnswers((prev) => ({ ...prev, userLocationCountry: country }));
      }
    }
  }, []);

  // Determine current question configuration
  const isStage1 = currentStep <= 5;
  const currentQuestion = isStage1
    ? STAGE1_QUESTIONS[currentStep - 1]
    : stage2Questions[currentStep - 6];

  // Select an option
  const handleSelectOption = (optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionValue
    }));
  };

  // Move to next step
  const handleNext = () => {
    if (!answers[currentQuestion.id]) return; // Must select an answer

    if (currentStep === 5) {
      // Transition from Stage 1 to Stage 2
      setIsGeneratingStage2(true);
      
      setTimeout(() => {
        const generatedQs = getAdaptiveQuestions(answers);
        setStage2Questions(generatedQs);
        setIsGeneratingStage2(false);
        setCurrentStep(6);
      }, 1200);
    } else if (currentStep === 10) {
      // Complete quiz and process matches
      handleFinalSubmission();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Move to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Execute matching algorithm and save profile
  const handleFinalSubmission = () => {
    setIsPlanningTrip(true);

    setTimeout(() => {
      try {
        // 1. Save answers to SessionStorage
        sessionStorage.setItem("travio_user_preferences", JSON.stringify(answers));

        // 2. Map companions to travel style for personality calculator
        const companionMap = {
          Solo: "solo",
          Partner: "couple",
          Friends: "friends",
          Family: "family"
        };
        const personalityPrefs = {
          budget: answers.budget,
          duration: answers.duration,
          style: companionMap[answers.companions] || "solo",
          season: answers.season,
          travelers: answers.companions === "Solo" ? 1 : answers.companions === "Partner" ? 2 : 4,
          interests: `${answers.tripType}, ${answers.activityDetail}`
        };

        const personality = calculatePersonality(personalityPrefs);
        setTravelerPersonality(personality);

        // 3. Compute match scores for all destinations
        const rankedMatches = calculateDestinationMatches(answers);
        setRecommendations(rankedMatches);
        setRecommendationMessage("Intelligent compatibility scores calculated for all catalog destinations.");

        setIsPlanningTrip(false);
        navigate("/results");
      } catch (error) {
        console.error("Quiz submission error:", error);
        setIsPlanningTrip(false);
        alert("There was an error generating your matches. Please try again.");
      }
    }, 1500);
  };

  // Render Loading Screen for Stage 2 Adaptive Analysis
  if (isGeneratingStage2) {
    return (
      <div className="preferences-page">
        <div className="preferences-card">
          <div className="analysis-loading">
            <div className="spinner" />
            <h3>Analyzing Stage 1 Choices...</h3>
            <p>Tailoring custom follow-up questions to match your preferences.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading Screen for Trip Matching
  if (isPlanningTrip) {
    return (
      <div className="preferences-page">
        <div className="preferences-card">
          <div className="analysis-loading">
            <div className="spinner" />
            <h3>Travio AI is Tailoring Your Trip...</h3>
            <p>Matching flights, hotels, and restaurants to build your personal budget breakdown.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const currentVal = answers[currentQuestion.id] || "";
  const progressPercent = Math.round(((currentStep - 1) / 10) * 100);

  // Set visual grid layout based on number of options
  const getGridClass = (optionsCount) => {
    if (optionsCount <= 3) return "grid-cols-3";
    if (optionsCount === 4) return "grid-cols-4";
    return "grid-cols-auto";
  };

  return (
    <div className="preferences-page">
      <div className="preferences-card">
        {/* Progress Bar Header */}
        <div className="progress-container">
          <div className="progress-header">
            <span className="progress-step-lbl">
              {isStage1 ? "Stage 1: Core Preferences" : "Stage 2: Adaptive Matching"} &bull; Question {currentStep} of 10
            </span>
            <span className="progress-pct-lbl">{progressPercent}% Completed</span>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Question Header */}
        <div className="question-header" key={currentQuestion.id}>
          <h2>{currentQuestion.title}</h2>
          <p>{currentQuestion.subtitle}</p>
        </div>

        {/* Options Grid */}
        <div className={`options-grid ${getGridClass(currentQuestion.options.length)}`} key={`grid-${currentQuestion.id}`}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentVal === option.value;
            return (
              <div
                key={option.value}
                className={`option-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectOption(option.value)}
              >
                <span className="option-card-emoji">{option.emoji}</span>
                <span className="option-card-label">{option.label}</span>
                <span className="option-card-desc">{option.description}</span>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="quiz-actions">
          <button
            className="back-btn"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{ opacity: currentStep === 1 ? 0 : 1, pointerEvents: currentStep === 1 ? "none" : "auto" }}
          >
            &larr; Back
          </button>
          <button
            className="next-btn"
            onClick={handleNext}
            disabled={!currentVal}
          >
            {currentStep === 10 ? "Plan My Journey" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
