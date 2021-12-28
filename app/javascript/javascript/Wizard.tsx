import React, { useState } from "react";

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: "What is your name?",
    description: "This is the name that will be displayed in your resume.",
  },
  {
    title: "How do you look like?",
    description:
      "Show how you look like (if you want) by linking a URL to a picture of yours. Tip: You can use the URL of Github/Gitlab avatar.",
  },
  {
    title: "Present yourself",
    description:
      "Sell/present yourself in few sentances. This will be the text that will be visible right below your name and most probably the first thing that a viewer will read.",
  },
  {
    title: "Where are you located?",
    description:
      "This information is usually quite important for remote positions because of legal and work hour overlap reasons.",
  },
  {
    title: "What is your education?",
    description:
      "Academic, cources, trainings. Share evrything that could help you stand out.",
  },
  {
    title: "What is your technology stack?",
    description:
      "Share the technologies with which you have experience and how much.",
  },
  {
    title: "What is your experience?",
    description:
      "Tell about your professional experience. Companies, roles and your major achievements.",
  },
  {
    title: "Do you have any side projects?",
    description: "Side projects are a nice way to present your skills.",
  },
  { title: "Voilà", description: "Your resume is ready." },
];

export function Wizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  return (
    <div className="wizard">
      <h1>{STEPS[currentStepIndex].title}</h1>
      <p>{STEPS[currentStepIndex].description}</p>
      <StepNavigation
        stepCount={STEPS.length}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
    </div>
  );
}

function StepNavigation({
  stepCount,
  currentStepIndex,
  onStepChange,
}: {
  stepCount: number;
  currentStepIndex: number;
  onStepChange: (newStepIndex: number) => void;
}) {
  return (
    <nav className="step-navigation">
      <ol>
        {[...Array(stepCount)].map((step, index) => (
          <li>
            {(() => {
              if (currentStepIndex < index) {
                return (
                  <a
                    className="step step-upcoming"
                    onClick={() => onStepChange(index)}
                  >
                    <span />
                  </a>
                );
              } else if (currentStepIndex > index) {
                return (
                  <a
                    className="step step-completed"
                    onClick={() => onStepChange(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </a>
                );
              } else {
                return (
                  <span className="step step-current">
                    <span />
                  </span>
                );
              }
            })()}
          </li>
        ))}
      </ol>
    </nav>
  );
}
