import React, { useState } from "react";
import { Resume } from "./Resume";
import { TextAreaInput } from "./TextAreaInput";
import { TextInput } from "./TextInput";

type Step = {
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    title: "What is your name?",
    description:
      "This preferably is your legal name. It will be shown at the top of your resume.",
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

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string>();
  const [summary, setSummary] = useState("");

  return (
    <>
      <div className="left">
        <div className="wizard">
          <h1>{STEPS[step].title}</h1>
          <p>{STEPS[step].description}</p>
          {(() => {
            switch (step) {
              case 0:
                return (
                  <>
                    <TextInput
                      name="name"
                      label="Name"
                      placeholder="John Doe"
                      value={name}
                      onInput={(event) => setName(event.target.value)}
                    />
                    <button
                      type="button"
                      className="button button-primary mt-5"
                      onClick={() => setStep(1)}
                    >
                      Next
                    </button>
                  </>
                );
              case 1:
                return (
                  <>
                    <TextInput
                      name="image"
                      label="Image URL"
                      placeholder="Your Github/Gitlab avatar URL"
                      value={image}
                      onBlur={(event) => setImage(event.target.value)}
                    />
                    <button
                      type="button"
                      className="button mt-5 m-3"
                      onClick={() => setStep(0)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button button-primary mt-5"
                      onClick={() => setStep(2)}
                    >
                      Next
                    </button>
                  </>
                );
              case 2:
                return (
                  <>
                    <TextAreaInput
                      name="summary"
                      label="Summary"
                      value={summary}
                      onInput={(event) => setSummary(event.target.value)}
                    />
                    <button
                      type="button"
                      className="button mt-5 m-3"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button button-primary mt-5"
                      onClick={() => setStep(3)}
                    >
                      Next
                    </button>
                  </>
                );
              default:
                return <div>Not implemented yet</div>;
            }
          })()}
          <StepNavigation
            stepCount={STEPS.length}
            currentStepIndex={step}
            onStepChange={setStep}
          />
        </div>
      </div>
      <div className="right">
        <div className="preview">
          <Resume
            name={name || "John Doe"}
            summary={summary || "Hi there! I am John."}
            image={image}
          />
        </div>
      </div>
      <div className="background" />
    </>
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
        {[...(Array(stepCount) as number[])].map((step, index) => (
          <li key={`${step}-${index}`}>
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
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
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
