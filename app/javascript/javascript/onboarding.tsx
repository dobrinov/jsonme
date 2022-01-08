import React, { useEffect, useRef, useState } from "react";
import { DatepickerInput } from "./DatepickerInput";
import { Resume, Training } from "./Resume";
import { TextAreaInput } from "./TextAreaInput";
import { TextInput } from "./TextInput";

type Step = {
  title: string;
  description: string;
};
type Persistable = { index: number };
type PersistedTraining = Training & Persistable;
type EditableTraining = Training | PersistedTraining;

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
  const [name, setName] = useState<string>();
  const [image, setImage] = useState<string>();
  const [summary, setSummary] = useState<string>();
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [trainings, setTrainings] = useState<Training[]>([]);

  const location = city && country ? { city, country } : undefined;

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
                      label="Profile picture URL"
                      placeholder="Tip: You can use the URL of Github/Gitlab avatar."
                      value={image}
                      onInput={(event) => setImage(event.target.value)}
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
              case 3:
                return (
                  <>
                    <TextInput
                      name="city"
                      label="City"
                      placeholder="Washington, D.C"
                      value={city}
                      onInput={(event) => setCity(event.target.value)}
                    />
                    <TextInput
                      name="country"
                      label="Country"
                      placeholder="United States"
                      value={country}
                      onInput={(event) => setCountry(event.target.value)}
                    />
                    <button
                      type="button"
                      className="button mt-5 m-3"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="button button-primary mt-5"
                      onClick={() => setStep(4)}
                    >
                      Next
                    </button>
                  </>
                );
              case 4:
                return (
                  <TrainingsStep
                    trainings={trainings}
                    previousStep={() => setStep(3)}
                    nextStep={() => setStep(5)}
                    onAddTraining={(training: Training) =>
                      setTrainings((current) => [...current, training])
                    }
                    onEditTraining={(training: PersistedTraining) => {
                      setTrainings((current) => [
                        ...current.slice(0, training.index),
                        training,
                        ...current.slice(training.index + 1),
                      ]);
                    }}
                    onDeleteTraining={(training: PersistedTraining) => {
                      setTrainings((current) => [
                        ...current.slice(0, training.index),
                        ...current.slice(training.index + 1, current.length),
                      ]);
                    }}
                  />
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
            location={location}
            trainings={trainings}
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

function TrainingsStep({
  trainings,
  previousStep,
  nextStep,
  onAddTraining,
  onEditTraining,
  onDeleteTraining,
}: {
  trainings: Training[];
  previousStep: () => void;
  nextStep: () => void;
  onAddTraining: (training: Training) => void;
  onEditTraining: (training: PersistedTraining) => void;
  onDeleteTraining: (training: PersistedTraining) => void;
}) {
  const drilldown = useDrilldown();
  const [selectedTraining, setSelectedTraining] = useState<EditableTraining>();

  return (
    <>
      <div {...drilldown.containerProps} className="foo">
        <div {...drilldown.secondaryProps} className="secondary">
          <TrainingForm
            key={selectedTraining?.institution.name}
            training={selectedTraining}
            onSave={(training: EditableTraining) => {
              if (isPersisted(training)) {
                onEditTraining(training);
              } else {
                onAddTraining(training);
              }

              drilldown.reset();
            }}
            onCancel={() => drilldown.reset()}
          />
        </div>

        <div {...drilldown.primaryProps} className="primary">
          <ul>
            {trainings.map((training, index) => (
              <Entry
                key={training.institution.name}
                title={training.institution.name}
                onEdit={() => {
                  setSelectedTraining({ ...training, index });
                  drilldown.animate();
                }}
                onDelete={() => {
                  onDeleteTraining({ ...training, index });
                }}
              />
            ))}
          </ul>
          <button
            className="button-new"
            onClick={() => {
              setSelectedTraining(undefined);
              drilldown.animate();
            }}
          >
            Add new education entry
          </button>

          <button
            type="button"
            className="button mt-5 m-3"
            onClick={previousStep}
          >
            Back
          </button>
          <button
            type="button"
            className="button button-primary button mt-5"
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

function TrainingForm({
  training: initialTraining,
  onSave,
  onCancel,
}: {
  training?: EditableTraining;
  onSave: (training: EditableTraining) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState<string>(
    initialTraining?.institution.name ?? ""
  );
  const [website, setWebsite] = useState<string>(
    initialTraining?.institution.website ?? ""
  );
  const [from, setFrom] = useState<string>(initialTraining?.period.from ?? "");
  const [to, setTo] = useState<string>(initialTraining?.period.to ?? "");
  const [summary, setSummary] = useState<string>(
    initialTraining?.summary ?? ""
  );

  const nameValid = !!name && name.length > 0;
  const valid = nameValid;

  return (
    <div>
      <TextInput
        name="name"
        value={name}
        label="Institution"
        onBlur={(event) => setName(event.target.value)}
        placeholder="The name of the institution where you did your studies. MIT, Coursera, Edx, etc."
      />
      <TextInput
        name="website"
        value={website}
        label="Website"
        onBlur={(event) => setWebsite(event.target.value)}
        placeholder="The webisite of the institution"
      />
      <DatepickerInput
        name="from"
        value={from}
        onBlur={(event) => setFrom(event.target.value)}
        type="month"
        label="From"
      />
      <DatepickerInput
        name="to"
        value={to}
        onBlur={(event) => setTo(event.target.value)}
        type="month"
        label="To"
      />
      <TextAreaInput
        name="summary"
        value={summary}
        onBlur={(event) => setSummary(event.target.value)}
        label="Summary"
        placeholder="What was your speciallity or cource name? What did you learn and/or achieve there."
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          const training: Training = {
            institution: { name, website },
            period: {
              from,
              to,
            },
            summary,
          };

          if (isPersisted(initialTraining)) {
            onSave({ ...training, index: initialTraining.index });
          } else {
            onSave(training);
          }
        }}
        disabled={!valid}
      >
        {isPersisted(initialTraining) ? "Update" : "Add"}
      </button>
    </div>
  );
}

function Entry({
  title,
  onEdit,
  onDelete,
}: {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="entry">
      <div>
        <a onClick={onEdit}>Edit</a>
        <a onClick={onDelete}>Delete</a>
      </div>
      <span>{title}</span>
    </div>
  );
}

function useDrilldown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState<number | null>(null);

  const TICK = 1;
  const DELTA = 5;

  useEffect(() => {
    if (!containerRef.current || !primaryRef.current || !secondaryRef.current)
      return;

    containerRef.current.style.overflow = "hidden";
    primaryRef.current.style.position = "relative";
    primaryRef.current.style.top = "0";
    primaryRef.current.style.marginTop = "0";
    secondaryRef.current.style.marginTop = `-${secondaryRef.current.offsetHeight}px`;
  }, [containerRef, primaryRef, secondaryRef]);

  useEffect(() => {
    if (!primaryRef.current || !secondaryRef.current || level === null) return;

    switch (level) {
      case 0: {
        const primaryOffsetTarget = 0;
        let currentPrimaryOffset = primaryRef.current.offsetHeight;

        let resetFirstOffsetTimer = setInterval(() => {
          currentPrimaryOffset -= DELTA;

          if (currentPrimaryOffset <= primaryOffsetTarget) {
            currentPrimaryOffset = primaryOffsetTarget;
            clearInterval(resetFirstOffsetTimer);
          }

          if (primaryRef.current) {
            primaryRef.current.style.top = `${currentPrimaryOffset}px`;
            primaryRef.current.style.marginTop = `-${currentPrimaryOffset}px`;
          }
        }, TICK);

        const secondOffsetTarget = secondaryRef.current;
        let currentSecondOffset = 0;

        let animateSecondOffsetTimer = setInterval(() => {
          currentSecondOffset += DELTA;

          if (currentSecondOffset >= secondOffsetTarget.offsetHeight) {
            currentSecondOffset = secondOffsetTarget.offsetHeight;
            clearInterval(animateSecondOffsetTimer);
          }

          secondOffsetTarget.style.marginTop = `-${currentSecondOffset}px`;
        }, TICK);
        break;
      }
      case 1: {
        let currentSecondOffset = secondaryRef.current.offsetHeight;
        const secondOffsetTarget = 0;
        let animateSecondOffsetTimer = setInterval(() => {
          currentSecondOffset -= DELTA;

          if (currentSecondOffset <= secondOffsetTarget) {
            currentSecondOffset = secondOffsetTarget;
            clearInterval(animateSecondOffsetTimer);
          }

          if (secondaryRef.current)
            secondaryRef.current.style.marginTop = `-${currentSecondOffset}px`;
        }, TICK);

        const primaryOffsetTarget = primaryRef.current.offsetHeight;
        let currentPrimaryOffset = 0;

        let animateFirstOffsetTimer = setInterval(() => {
          currentPrimaryOffset += DELTA;

          if (currentPrimaryOffset >= primaryOffsetTarget) {
            currentPrimaryOffset = primaryOffsetTarget;
            clearInterval(animateFirstOffsetTimer);
          }

          if (primaryRef.current) {
            primaryRef.current.style.top = `${currentPrimaryOffset}px`;
            primaryRef.current.style.marginTop = `-${currentPrimaryOffset}px`;
          }
        }, TICK);

        break;
      }
    }
  }, [level]);

  const animate = () => setLevel(1);
  const reset = () => setLevel(0);

  return {
    animate,
    reset,
    containerProps: { ref: containerRef },
    primaryProps: { ref: primaryRef },
    secondaryProps: { style: { marginTop: "-1000px" }, ref: secondaryRef },
  };
}

function isPersisted(object?: Persistable | {}): object is Persistable {
  return object !== undefined && "index" in object;
}
