import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  monthAndYearAfterOrEqualTo,
  monthAndYearBeforeOrEqualTo,
  useForm,
  validatePresence,
  validateUrlFormat,
} from "./form";
import {
  Complexity,
  Employment,
  Knowledge,
  Resume,
  SideProject,
  Technology,
  Training,
  YesNo,
} from "./Resume";
import { FormSelectInput } from "./SelectInput";
import { FormTextAreaInput, TextAreaInput } from "./TextAreaInput";
import { FormTextInput, TextInput } from "./TextInput";
import { FormDatepickerInput } from "./DatepickerInput";
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

type PersistedEmployment = Employment & Persistable;
type EditableEmployment = Employment | PersistedEmployment;

type PersistedSideProject = SideProject & Persistable;
type EditableSideProject = SideProject | PersistedSideProject;

type TrainingForm = {
  name: string;
  website: string | null;
  from: MonthAndYear | null;
  to: MonthAndYear | null;
  summary: string;
};

type TechnologyForm = {
  name: string;
  website: string;
  taskComplexity: Complexity | null;
  knowledgeOfFeatures: Knowledge | null;
  knowledgeOfBestPractices: Knowledge | null;
  canMentor: YesNo | null;
  recentlyUsed: YesNo | null;
};

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
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [sideProjects, setSideProjects] = useState<SideProject[]>([]);

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
                    onAddTechnology={(technology: Technology) => {
                      setTechnologies((current) => [...current, technology]);
                    }}
                    onEditTechnology={(technology: PersistedTechnology) => {
                      setTechnologies((current) => [
                        ...current.slice(0, technology.index),
                        technology,
                        ...current.slice(technology.index + 1),
                      ]);
                    }}
                    onDeleteTechnology={(technology: PersistedTechnology) => {
                      setTechnologies((current) => [
                        ...current.slice(0, technology.index),
                        ...current.slice(technology.index + 1, current.length),
                      ]);
                    }}
                  />
                );
              case 6:
                return (
                  <EmploymentsStep
                    employments={employments}
                    previousStep={() => setStep(5)}
                    nextStep={() => setStep(7)}
                    onAddEmployment={(employment: Employment) => {
                      setEmployments((current) => [...current, employment]);
                    }}
                    onEditEmployment={(employment: PersistedEmployment) => {
                      setEmployments((current) => [
                        ...current.slice(0, employment.index),
                        employment,
                        ...current.slice(employment.index + 1),
                      ]);
                    }}
                    onDeleteEmployment={(employment: PersistedEmployment) => {
                      setEmployments((current) => [
                        ...current.slice(0, employment.index),
                        ...current.slice(employment.index + 1, current.length),
                      ]);
                    }}
                  />
                );
              case 7:
                return (
                  <SideProjectsStep
                    sideProjects={sideProjects}
                    previousStep={() => setStep(6)}
                    nextStep={() => setStep(8)}
                    onAddSideProject={(sideProject: SideProject) => {}}
                    onEditSideProject={(
                      sideProject: PersistedSideProject
                    ) => {}}
                    onDeleteSideProject={(
                      sideProject: PersistedSideProject
                    ) => {}}
                  />
                );
              case 8:
                return null;
              default:
                throw new Error("Invalid wizard step");
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
            technologies={technologies}
            employments={employments}
            sideProjects={sideProjects}
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
  const form = useForm<TrainingForm>({
    name: {
      value: initialTraining?.institution.name ?? "",
      validations: [validatePresence],
    },
    website: {
      value: initialTraining?.institution.website ?? "",
      validations: [validatePresence, validateUrlFormat],
    },
    from: {
      value: initialTraining?.period.from ?? null,
      validations: [
        validatePresence,
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: (form) => form.to,
          message: "cannot be after 'To'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    to: {
      value: initialTraining?.period.to ?? null,
      validations: [
        validatePresence,
        monthAndYearAfterOrEqualTo({
          value: (form) => form.to,
          otherValue: (form) => form.from,
          message: "cannot be before 'From'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.to,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    summary: {
      value: initialTraining?.summary ?? "",
      validations: [validatePresence],
    },
  });

  const [ongoing, setOngoing] = useState<boolean>(
    isPersisted(initialTraining) ? form.values.to === null : false
  );

  return (
    <div>
      <FormTextInput
        form={form}
        name="name"
        label="Institution"
        placeholder="The name of the institution where you did your studies. MIT, Coursera, Edx, etc."
      />
      <FormTextInput
        form={form}
        name="website"
        label="Website"
        placeholder="The webisite of the institution"
      />
      <FormDatepickerInput form={form} name="from" label="From" />
      <ToggleInput
        on={ongoing}
        name="ongoing"
        label="Ongoing"
        onChange={(value: boolean) => {
          setOngoing(value);
          if (!value) form.update({ field: "to", value: null });
        }}
      />
      {!ongoing && <FormDatepickerInput form={form} name="to" label="To" />}
      <FormTextAreaInput
        form={form}
        name="summary"
        label="Summary"
        placeholder="What was your speciallity or cource name? What did you learn and/or achieve there."
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          if (!form.validate()) return;
          if (
            !form.values.name ||
            !form.values.website ||
            !form.values.from ||
            !form.values.summary
          )
            return;

          const training: Training = {
            institution: {
              name: form.values.name,
              website: addProtocol(form.values.website),
            },
            period: new Period(form.values.from, form.values.to ?? null),
            summary: form.values.summary,
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
            onSave={(technology: EditableTechnology) => {
              if (isPersisted(technology)) {
                onEditTechnology(technology);
              } else {
                onAddTechnology(technology);
              }

              drilldown.reset();
            }}
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
  const form = useForm<TechnologyForm>({
    name: {
      value: initialTechnology?.name ?? "",
      validations: [validatePresence],
    },
    website: {
      value: initialTechnology?.website ?? "",
      validations: [validatePresence, validateUrlFormat],
    },
    taskComplexity: {
      value: initialTechnology?.taskComplexity ?? null,
      validations: [validatePresence],
    },
    knowledgeOfFeatures: {
      value: initialTechnology?.knowledgeOfFeatures ?? null,
      validations: [validatePresence],
    },
    knowledgeOfBestPractices: {
      value: initialTechnology?.knowledgeOfBestPractices ?? null,
      validations: [validatePresence],
    },
    canMentor: {
      value: initialTechnology?.canMentor ?? null,
      validations: [validatePresence],
    },
    recentlyUsed: {
      value: initialTechnology?.recentlyUsed ?? null,
      validations: [validatePresence],
    },
  });

  return (
    <div>
      <FormTextInput
        form={form}
        name="name"
        label="Name"
        placeholder="Javascript, Ruby, Rust, CSS, etc."
      />
      <FormTextInput
        form={form}
        name="website"
        label="Website"
        placeholder="The official website of the technology"
      />
      <FormSelectInput
        form={form}
        name="taskComplexity"
        collection={TASK_COMPLEXITIES}
        prompt={true}
        label="How difficult problems you can solve?"
      />
      <FormSelectInput
        form={form}
        name="knowledgeOfFeatures"
        collection={KNOWLEDGE_LEVELS}
        prompt={true}
        label="How good is your knowledge of technology's features?"
      />
      <FormSelectInput
        form={form}
        name="knowledgeOfBestPractices"
        collection={KNOWLEDGE_LEVELS}
        prompt={true}
        label="How good is your knowledge of technology's best practices?"
      />
      <FormSelectInput
        form={form}
        name="canMentor"
        collection={YES_NOS}
        prompt={true}
        label="Can you mentor others?"
      />
      <FormSelectInput
        form={form}
        name="recentlyUsed"
        collection={YES_NOS}
        prompt={true}
        label="Have you used this technology recently?"
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          if (!form.validate()) return;

          if (
            !form.values.name ||
            !form.values.website ||
            !form.values.taskComplexity ||
            !form.values.knowledgeOfFeatures ||
            !form.values.knowledgeOfBestPractices ||
            form.values.canMentor === null ||
            form.values.recentlyUsed === null
          )
            return;

          const technology: Technology = {
            name: form.values.name,
            website: addProtocol(form.values.website),
            recentlyUsed: form.values.recentlyUsed,
            canMentor: form.values.canMentor,
            knowledgeOfBestPractices: form.values.knowledgeOfBestPractices,
            knowledgeOfFeatures: form.values.knowledgeOfFeatures,
            taskComplexity: form.values.taskComplexity,
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

function EmploymentsStep({
  employments,
  previousStep,
  nextStep,
  onAddEmployment,
  onEditEmployment,
  onDeleteEmployment,
}: {
  employments: Employment[];
  previousStep: () => void;
  nextStep: () => void;
  onAddEmployment: (employment: Employment) => void;
  onEditEmployment: (employment: PersistedEmployment) => void;
  onDeleteEmployment: (employment: PersistedEmployment) => void;
}) {
  const drilldown = useDrilldown();
  const [selectedEmployment, setSelectedEmployment] =
    useState<EditableEmployment>();

  return (
    <>
      <div {...drilldown.containerProps} className="foo">
        <div {...drilldown.secondaryProps} className="secondary">
          <EmploymentForm
            key={selectedEmployment?.employer.name}
            employment={selectedEmployment}
            onSave={(employment: EditableEmployment) => {
              if (isPersisted(employment)) {
                onEditEmployment(employment);
              } else {
                onAddEmployment(employment);
              }

              drilldown.reset();
            }}
            onCancel={() => drilldown.reset()}
          />
        </div>

        <div {...drilldown.primaryProps} className="primary">
          <ul>
            {employments.map((employment, index) => (
              <Entry
                key={employment.employer.name}
                title={employment.employer.name}
                onEdit={() => {
                  setSelectedEmployment({ ...employment, index });
                  drilldown.animate();
                }}
                onDelete={() => {
                  onDeleteEmployment({ ...employment, index });
                }}
              />
            ))}
          </ul>
          <button
            className="button-new"
            onClick={() => {
              setSelectedEmployment(undefined);
              drilldown.animate();
            }}
          >
            Add employment
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

function EmploymentForm({
  employment: initialEmployment,
  onSave,
  onCancel,
}: {
  employment?: EditableEmployment;
  onSave: (training: EditableEmployment) => void;
  onCancel: () => void;
}) {
  const form = useForm<TrainingForm>({
    name: {
      value: initialEmployment?.employer.name ?? "",
      validations: [validatePresence],
    },
    website: {
      value: initialEmployment?.employer.website ?? "",
      validations: [validatePresence, validateUrlFormat],
    },
    from: {
      value: initialEmployment?.period.from ?? null,
      validations: [
        validatePresence,
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: (form) => form.to,
          message: "cannot be after 'To'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    to: {
      value: initialEmployment?.period.to ?? null,
      validations: [
        validatePresence,
        monthAndYearAfterOrEqualTo({
          value: (form) => form.to,
          otherValue: (form) => form.from,
          message: "cannot be before 'From'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.to,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    summary: {
      value: initialEmployment?.summary ?? "",
      validations: [validatePresence],
    },
  });

  const [ongoing, setOngoing] = useState<boolean>(
    isPersisted(initialEmployment) ? form.values.to === null : false
  );

  return (
    <div>
      <FormTextInput
        form={form}
        name="name"
        label="Company name"
        placeholder="The name of the company that employed you."
      />
      <FormTextInput
        form={form}
        name="website"
        label="Website"
        placeholder="The webisite of the employer"
      />
      <FormDatepickerInput form={form} name="from" label="From" />
      <ToggleInput
        on={ongoing}
        name="ongoing"
        label="Ongoing"
        onChange={(value: boolean) => {
          setOngoing(value);
          if (!value) form.update({ field: "to", value: null });
        }}
      />
      {!ongoing && <FormDatepickerInput form={form} name="to" label="To" />}
      <FormTextAreaInput
        form={form}
        name="summary"
        label="Summary"
        placeholder="What was the business of the company for which you have been working/are working."
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          if (!form.validate()) return;
          if (
            !form.values.name ||
            !form.values.website ||
            !form.values.from ||
            !form.values.summary
          )
            return;

          const employment: Employment = {
            employer: {
              name: form.values.name,
              website: addProtocol(form.values.website),
            },
            period: new Period(form.values.from, form.values.to ?? null),
            summary: form.values.summary,
          };

          if (isPersisted(initialEmployment)) {
            onSave({ ...employment, index: initialEmployment.index });
          } else {
            onSave(employment);
          }
        }}
      >
        {isPersisted(initialEmployment) ? "Update" : "Add"}
      </button>
    </div>
  );
}

function SideProjectsStep({
  sideProjects,
  previousStep,
  nextStep,
  onAddSideProject,
  onEditSideProject,
  onDeleteSideProject,
}: {
  sideProjects: SideProject[];
  previousStep: () => void;
  nextStep: () => void;
  onAddSideProject: (sideProject: SideProject) => void;
  onEditSideProject: (sideProject: PersistedSideProject) => void;
  onDeleteSideProject: (sideProject: PersistedSideProject) => void;
}) {
  const drilldown = useDrilldown();
  const [selectedSideProject, setSelectedSideProject] =
    useState<EditableSideProject>();

  return (
    <>
      <div {...drilldown.containerProps} className="foo">
        <div {...drilldown.secondaryProps} className="secondary">
          {/* <SideProjectForm
            key={selectedEmployment?.employer.name}
            employment={selectedEmployment}
            onSave={(employment: EditableEmployment) => {
              if (isPersisted(employment)) {
                onEditEmployment(employment);
              } else {
                onAddEmployment(employment);
              }

              drilldown.reset();
            }}
            onCancel={() => drilldown.reset()}
          /> */}
        </div>

        <div {...drilldown.primaryProps} className="primary">
          <ul>
            {sideProjects.map((sideProject, index) => (
              <Entry
                key={sideProject.name}
                title={sideProject.name}
                onEdit={() => {
                  setSelectedSideProject({ ...sideProject, index });
                  drilldown.animate();
                }}
                onDelete={() => {
                  onDeleteSideProject({ ...sideProject, index });
                }}
              />
            ))}
          </ul>
          <button
            className="button-new"
            onClick={() => {
              setSelectedSideProject(undefined);
              drilldown.animate();
            }}
          >
            Add a side project
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

function SideProjectForm({
  employment: initialEmployment,
  onSave,
  onCancel,
}: {
  employment?: EditableEmployment;
  onSave: (training: EditableEmployment) => void;
  onCancel: () => void;
}) {
  const form = useForm<TrainingForm>({
    name: {
      value: initialEmployment?.employer.name ?? "",
      validations: [validatePresence],
    },
    website: {
      value: initialEmployment?.employer.website ?? "",
      validations: [validatePresence, validateUrlFormat],
    },
    from: {
      value: initialEmployment?.period.from ?? null,
      validations: [
        validatePresence,
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: (form) => form.to,
          message: "cannot be after 'To'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.from,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    to: {
      value: initialEmployment?.period.to ?? null,
      validations: [
        validatePresence,
        monthAndYearAfterOrEqualTo({
          value: (form) => form.to,
          otherValue: (form) => form.from,
          message: "cannot be before 'From'",
        }),
        monthAndYearBeforeOrEqualTo({
          value: (form) => form.to,
          otherValue: () => MonthAndYear.current(),
          message: "cannot be in the future",
        }),
      ],
    },
    summary: {
      value: initialEmployment?.summary ?? "",
      validations: [validatePresence],
    },
  });

  const [ongoing, setOngoing] = useState<boolean>(
    isPersisted(initialEmployment) ? form.values.to === null : false
  );

  return (
    <div>
      <FormTextInput
        form={form}
        name="name"
        label="Company name"
        placeholder="The name of the company that employed you."
      />
      <FormTextInput
        form={form}
        name="website"
        label="Website"
        placeholder="The webisite of the employer"
      />
      <FormDatepickerInput form={form} name="from" label="From" />
      <ToggleInput
        on={ongoing}
        name="ongoing"
        label="Ongoing"
        onChange={(value: boolean) => {
          setOngoing(value);
          if (!value) form.update({ field: "to", value: null });
        }}
      />
      {!ongoing && <FormDatepickerInput form={form} name="to" label="To" />}
      <FormTextAreaInput
        form={form}
        name="summary"
        label="Summary"
        placeholder="What was the business of the company for which you have been working/are working."
      />
      <button className="button mt-5 m-3" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="button button-primary mt-5"
        onClick={() => {
          if (!form.validate()) return;
          if (
            !form.values.name ||
            !form.values.website ||
            !form.values.from ||
            !form.values.summary
          )
            return;

          const employment: Employment = {
            employer: {
              name: form.values.name,
              website: addProtocol(form.values.website),
            },
            period: new Period(form.values.from, form.values.to ?? null),
            summary: form.values.summary,
          };

          if (isPersisted(initialEmployment)) {
            onSave({ ...employment, index: initialEmployment.index });
          } else {
            onSave(employment);
          }
        }}
      >
        {isPersisted(initialEmployment) ? "Update" : "Add"}
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

function addProtocol(url: string) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "http://" + url;
  }

  return url;
}
