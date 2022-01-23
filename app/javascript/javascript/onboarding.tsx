import React, { useEffect, useMemo, useRef, useState } from "react";
import { DatepickerInput } from "./DatepickerInput";
import { Resume, Technology, Training } from "./Resume";
import { SelectInput } from "./SelectInput";
import { TextAreaInput } from "./TextAreaInput";
import { TextInput } from "./TextInput";
import { MonthAndYear, Period } from "./time";
import { ToggleInput } from "./ToggleInput";

type Step = {
  title: string;
  description: string;
};
type Persistable = { index: number };

type PersistedTraining = Training & Persistable;
type EditableTraining = Training | PersistedTraining;

type PersistedTechnology = Technology & Persistable;
type EditableTechnology = Technology | PersistedTechnology;

type Complexity = "easy" | "intermediate" | "hard";
type Knowledge = "poor" | "average" | "good";

const TASK_COMPLEXITIES: { id: Complexity; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "intermediate", label: "Intermediate" },
  { id: "hard", label: "Hard" },
];

const KNOWLEDGE_LEVELS: { id: Knowledge; label: string }[] = [
  { id: "poor", label: "Poor" },
  { id: "average", label: "Average" },
  { id: "good", label: "Good" },
];

const YES_NOS: { id: "yes" | "no"; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

const URL_REGEX =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

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
  const [technologies, setTechnologies] = useState<Technology[]>([]);

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
              case 5:
                return (
                  <TechnologyStackStep
                    technologies={technologies}
                    previousStep={() => setStep(4)}
                    nextStep={() => setStep(6)}
                    onAddTechnology={(training: Technology) => {}}
                    onEditTechnology={(training: PersistedTechnology) => {}}
                    onDeleteTechnology={(training: PersistedTechnology) => {}}
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
            Add education
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
  // Name
  const [name, setName] = useState<string | undefined>(
    initialTraining?.institution.name
  );
  const [nameErrors, setNameErrors] = useState<string[]>([]);
  const nameValid = nameErrors.length === 0;

  const nameIsValid = validate({
    validations: [validatePresence],
    setErrors: setNameErrors,
  });

  useEffect(() => {
    nameIsValid({ value: name, force: false });
  }, [name]);

  // Website
  const [website, setWebsite] = useState<string | undefined>(
    initialTraining?.institution.website
  );
  const [websiteErrors, setWebsiteErrors] = useState<string[]>([]);
  const websiteValid = websiteErrors.length === 0;

  const websiteIsValid = validate({
    validations: [validatePresence, validateUrlFormat],
    setErrors: setWebsiteErrors,
  });

  useEffect(() => {
    websiteIsValid({ value: website, force: false });
  }, [website]);

  // From
  const [from, setFrom] = useState<MonthAndYear | undefined | null>(
    initialTraining?.period.from
  );
  const [fromErrors, setFromErrors] = useState<string[]>([]);
  const fromValid = fromErrors.length === 0;

  const fromIsValid = validate<MonthAndYear>({
    validations: [
      validatePresence,
      validateBeforeOrEqual({
        other: () => to,
        message: "cannot be after 'To'",
      }),
      validateBeforeOrEqual({
        other: MonthAndYear.current(),
        message: "cannot be in the future",
      }),
    ],
    setErrors: setFromErrors,
  });

  useEffect(() => {
    fromIsValid({ value: from, force: false });
  }, [from]);

  // To
  const [to, setTo] = useState<MonthAndYear | null | undefined>(
    initialTraining?.period.to
  );
  const [toErrors, setToErrors] = useState<string[]>([]);
  const toValid = toErrors.length === 0;

  const toIsValid = validate<MonthAndYear>({
    validations: [
      validatePresence,
      validateAfterOrEqual({
        other: () => from,
        message: "cannot be prior 'From'",
      }),
      validateBeforeOrEqual({
        other: MonthAndYear.current(),
        message: "cannot be in the future",
      }),
    ],
    setErrors: setToErrors,
  });

  useEffect(() => {
    toIsValid({ value: to, force: false });
  }, [to]);

  // Summary
  const [summary, setSummary] = useState<string | undefined>(
    initialTraining?.summary
  );
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const summaryValid = summaryErrors.length === 0;

  const summaryIsValid = validate({
    validations: [validatePresence],
    setErrors: setSummaryErrors,
  });

  useEffect(() => {
    summaryIsValid({ value: summary, force: false });
  }, [summary]);

  const [ongoing, setOngoing] = useState<boolean>(to === null);

  const isValid = (): boolean => {
    const validationResults = [
      nameIsValid({ value: name, force: true }).length === 0,
      websiteIsValid({ value: website, force: true }).length === 0,
      fromIsValid({ value: from, force: true }).length === 0,
      toIsValid({ value: to, force: true }).length === 0,
      summaryIsValid({ value: summary, force: true }).length === 0,
    ];

    return validationResults.filter((result) => !result).length === 0;
  };

  return (
    <div>
      <TextInput
        name="name"
        value={name}
        label="Institution"
        state={nameValid ? "normal" : "error"}
        addendum={nameErrors[0]}
        onBlur={(event) => {
          if (event.target.value !== "") setName(event.target.value);
        }}
        placeholder="The name of the institution where you did your studies. MIT, Coursera, Edx, etc."
      />
      <TextInput
        name="website"
        value={website}
        label="Website"
        state={websiteValid ? "normal" : "error"}
        addendum={websiteErrors[0]}
        onBlur={(event) => {
          event.target.value && setWebsite(event.target.value);
        }}
        placeholder="The webisite of the institution"
      />
      <DatepickerInput
        name="from"
        value={from?.toString()}
        state={fromValid ? "normal" : "error"}
        addendum={fromErrors[0]}
        onChange={(event) => {
          if (event.target.value) {
            setFrom(MonthAndYear.parse(event.target.value));
          } else {
            setFrom(null);
          }
        }}
        type="month"
        label="From"
      />
      <ToggleInput
        on={ongoing}
        name="ongoing"
        label="Ongoing"
        onChange={(value: boolean) => {
          setOngoing(value);
          setTo(null);
        }}
      />
      {!ongoing && (
        <DatepickerInput
          name="to"
          value={to?.toString()}
          state={toValid ? "normal" : "error"}
          addendum={toErrors[0]}
          onChange={(event) =>
            event.target.value && setTo(MonthAndYear.parse(event.target.value))
          }
          type="month"
          label="To"
        />
      )}
      <TextAreaInput
        name="summary"
        value={summary}
        state={summaryValid ? "normal" : "error"}
        addendum={summaryErrors[0]}
        onBlur={(event) => {
          event.target.value && setSummary(event.target.value);
        }}
        label="Summary"
        placeholder="What was your speciallity or cource name? What did you learn and/or achieve there."
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          if (!isValid()) return;
          if (!name || !website || !from || !summary) return;

          const training: Training = {
            institution: { name, website },
            period: new Period(from, to ?? null),
            summary,
          };

          if (isPersisted(initialTraining)) {
            onSave({ ...training, index: initialTraining.index });
          } else {
            onSave(training);
          }
        }}
      >
        {isPersisted(initialTraining) ? "Update" : "Add"}
      </button>
    </div>
  );
}

function TechnologyStackStep({
  technologies,
  previousStep,
  nextStep,
  onAddTechnology,
  onEditTechnology,
  onDeleteTechnology,
}: {
  technologies: Technology[];
  previousStep: () => void;
  nextStep: () => void;
  onAddTechnology: (technology: Technology) => void;
  onEditTechnology: (technology: PersistedTechnology) => void;
  onDeleteTechnology: (technology: PersistedTechnology) => void;
}) {
  const drilldown = useDrilldown();
  const [selectedTechnology, setSelectedTechnology] =
    useState<EditableTechnology>();

  return (
    <>
      <div {...drilldown.containerProps} className="foo">
        <div {...drilldown.secondaryProps} className="secondary">
          <TechnologyForm
            key={selectedTechnology?.name}
            technology={selectedTechnology}
            onSave={() => alert("save")}
            onCancel={() => drilldown.reset()}
          />
        </div>

        <div {...drilldown.primaryProps} className="primary">
          <ul>
            {technologies.map((technology, index) => (
              <Entry
                key={technology.name}
                title={technology.name}
                onEdit={() => {
                  setSelectedTechnology({ ...technology, index });
                  drilldown.animate();
                }}
                onDelete={() => {
                  onDeleteTechnology({ ...technology, index });
                }}
              />
            ))}
          </ul>
          <button
            className="button-new"
            onClick={() => {
              setSelectedTechnology(undefined);
              drilldown.animate();
            }}
          >
            Add technology
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

function TechnologyForm({
  technology: initialTechnology,
  onSave,
  onCancel,
}: {
  technology?: EditableTechnology;
  onSave: (technology: EditableTechnology) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState<string | undefined>();
  const [website, setWebsite] = useState<string | undefined>();
  const [taskComplexity, setTaskComplexity] = useState<
    Complexity | undefined
  >();
  const [knowledgeOfFeatures, setKnowledgeOfFeatures] = useState<
    Knowledge | undefined
  >();
  const [knowledgeOfBestPractices, setKnowledgeOfBestPractices] = useState<
    Knowledge | undefined
  >();
  const [canMentor, setCanMentor] = useState<boolean | undefined>();
  const [recentlyUsed, setRecentlyUsed] = useState<boolean | undefined>();

  return (
    <div>
      <TextInput
        name="name"
        value={name}
        label="Name"
        placeholder="Javascript, Ruby, Rust, CSS, etc."
        onBlur={(event) => {
          if (event.target.value !== "") setName(event.target.value);
        }}
      />
      <TextInput
        name="website"
        value={website}
        label="Website"
        placeholder="The official website of the technology"
        onBlur={(event) => {
          if (event.target.value !== "") setWebsite(event.target.value);
        }}
      />
      <SelectInput
        name="taskComplexity"
        value={taskComplexity}
        collection={TASK_COMPLEXITIES}
        prompt={true}
        label="How difficult problems you can solve?"
        onChange={(event) => {
          setTaskComplexity(event.target.value as Complexity);
        }}
      />
      <SelectInput
        name="knowledgeOfFeatures"
        value={knowledgeOfFeatures}
        collection={KNOWLEDGE_LEVELS}
        prompt={true}
        label="How good is your knowledge of technology's features?"
        onChange={(event) => {
          setKnowledgeOfFeatures(event.target.value as Knowledge);
        }}
      />
      <SelectInput
        name="knowledgeOfBestPractices"
        value={knowledgeOfBestPractices}
        collection={KNOWLEDGE_LEVELS}
        prompt={true}
        label="How good is your knowledge of technology's best practices?"
        onChange={(event) => {
          setKnowledgeOfBestPractices(event.target.value as Knowledge);
        }}
      />
      <SelectInput
        name="canMentorOthers"
        value={canMentor ? "yes" : "no"}
        collection={YES_NOS}
        prompt={true}
        label="Can you mentor others?"
        onChange={(event) => {
          setCanMentor(event.target.value === "yes");
        }}
      />
      <SelectInput
        name="recentlyUsed"
        value={recentlyUsed ? "yes" : "no"}
        collection={YES_NOS}
        prompt={true}
        label="Have you used this technology recently?"
        onChange={(event) => {
          setRecentlyUsed(event.target.value === "yes");
        }}
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          // if (!isValid({ forceValidation: true })) return;
          if (
            !name ||
            !website ||
            !taskComplexity ||
            !knowledgeOfFeatures ||
            !knowledgeOfBestPractices ||
            canMentor === undefined ||
            recentlyUsed === undefined
          )
            return;

          const technology: Technology = {
            name,
            website,
            recentlyUsed,
            canMentor,
            knowledgeOfBestPractices,
            knowledgeOfFeatures,
            taskComplexity,
          };

          if (isPersisted(initialTechnology)) {
            onSave({ ...technology, index: initialTechnology.index });
          } else {
            onSave(technology);
          }
        }}
      >
        {isPersisted(initialTechnology) ? "Update" : "Add"}
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

type ValidationProps<T> = {
  value: T | null | undefined;
  force: boolean;
};

type Validation<T> = ({ value, force }: ValidationProps<T>) => string | null;

function validate<T>({
  validations,
  setErrors,
}: {
  validations: Validation<T>[];
  setErrors: (errors: string[]) => void;
}) {
  return ({ value, force }: ValidationProps<T>) => {
    const errors = validations
      .map((validation) => validation({ value, force }))
      .filter(isNotNullOrUndefined);

    setErrors(errors);

    return errors;
  };
}

function validatePresence<T>({ value, force }: ValidationProps<T>) {
  const message = "must be present";
  if (value === undefined) {
    return force ? message : null;
  } else if (typeof value === "string") {
    return value.length === 0 ? message : null;
  } else {
    return value === null ? message : null;
  }
}

type ValueOrFn<T> = T | (() => T);
type MonthAndYearSequenceValidation = ({
  other,
  message,
}: {
  other: ValueOrFn<MonthAndYear | null | undefined>;
  message: string;
}) => Validation<MonthAndYear>;

const validateBefore: MonthAndYearSequenceValidation = ({ other, message }) => {
  return validateMonthAndYearSequence({
    other,
    message,
    comparissonFn: (a: MonthAndYear, b: MonthAndYear) => a.isBefore(b),
  });
};

const validateBeforeOrEqual: MonthAndYearSequenceValidation = ({
  other,
  message,
}) => {
  return validateMonthAndYearSequence({
    other,
    message,
    comparissonFn: (a: MonthAndYear, b: MonthAndYear) => a.isBeforeOrEqual(b),
  });
};

const validateAfter: MonthAndYearSequenceValidation = ({ other, message }) => {
  return validateMonthAndYearSequence({
    other,
    message,
    comparissonFn: (a: MonthAndYear, b: MonthAndYear) => a.isAfter(b),
  });
};

const validateAfterOrEqual: MonthAndYearSequenceValidation = ({
  other,
  message,
}) => {
  return validateMonthAndYearSequence({
    other,
    message,
    comparissonFn: (a: MonthAndYear, b: MonthAndYear) => a.isAfterOrEqual(b),
  });
};

function validateMonthAndYearSequence({
  other: otherRaw,
  message,
  comparissonFn,
}: {
  other: ValueOrFn<MonthAndYear | null | undefined>;
  message: string;
  comparissonFn: (a: MonthAndYear, b: MonthAndYear) => boolean;
}): Validation<MonthAndYear> {
  return ({ value, force }: ValidationProps<MonthAndYear>) => {
    const otherFieldValue =
      typeof otherRaw === "function" ? otherRaw() : otherRaw;

    if (
      value === null ||
      otherFieldValue === null ||
      otherFieldValue === undefined
    )
      return null;

    if (value === undefined) {
      return force ? message : null;
    } else {
      return comparissonFn(value, otherFieldValue) ? null : message;
    }
  };
}

function validateUrlFormat<T>({ value, force }: ValidationProps<T>) {
  const message = "is invalid";
  if (value === undefined) {
    return force ? message : null;
  } else if (typeof value === "string") {
    return URL_REGEX.test(value) ? null : message;
  } else {
    throw new Error("value must be a string");
  }
}

function isNotNullOrUndefined<T extends Object>(
  input: null | undefined | T
): input is T {
  return input !== null && input !== undefined;
}
