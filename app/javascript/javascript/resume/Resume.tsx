import React, { ReactNode, useState } from "react";
import { addProtocol, capitalize, startingYear } from "../utils";
import { Avatar } from "../Avatar";
import { Section } from "./Section";
import { Timeline, TimelineEvent } from "./Timeline";
import { Blank } from "./Blank";
import { useModal } from "../ModalProvider";
import { FormTextInput } from "../TextInput";
import { FormDatepickerInput } from "../DatepickerInput";
import { ToggleInput } from "../ToggleInput";
import { FormTextAreaInput } from "../TextAreaInput";
import { useForm, validatePresence } from "../form";
import { MonthAndYear } from "../time";

type Persistable = { index: number };

export type Period = { from: MonthAndYear; to: MonthAndYear | null };

type Employer = {
  name: string;
  website?: string;
};

export type Achievement = {
  title: string;
  summary: string;
  technologies: string[];
};

export type Role = {
  title: string;
  summary: string;
  majorAchievements?: Achievement[];
};

export type Employment = {
  summary: string;
  employer: Employer;
  period: Period;
  roles?: Role[];
};

type PersistedEmployment = Employment & Persistable;
type EditableEmployment = Employment | PersistedEmployment;

type PersistedRole = Role & Persistable;
type EditableRole = Role | PersistedRole;

type Location = {
  city: string;
  state?: string;
  country: string;
};

type Institution = {
  name: string;
  website?: string;
};

export type Training = {
  institution: Institution;
  summary: string;
  period: Period;
};

export type Complexity = "easy" | "intermediate" | "hard";
export type Knowledge = "poor" | "average" | "good";
export type YesNo = "yes" | "no";

export type Technology = {
  name: string;
  website: string;
  recentlyUsed: YesNo;
  canMentor: YesNo;
  knowledgeOfBestPractices: Knowledge;
  knowledgeOfFeatures: Knowledge;
  taskComplexity: Complexity;
};

export type SideProject = {
  name: string;
  website: string;
  online: boolean;
  period: Period;
  summary: string;
};

export type Resume = {
  name?: string;
  summary?: string;
  image?: string;
  location?: Location;
  employments?: Employment[];
  trainings?: Training[];
  sideProjects?: SideProject[];
  technologies?: Technology[];
};

type EditableResume = {
  editable: boolean;
  onUpdate: (resume: Resume) => void;
} & Resume;

export function Resume({
  name,
  image,
  summary,
  location,
  employments,
  trainings,
  sideProjects,
  technologies,
  editable: rawEditable,
  onUpdate,
}: EditableResume) {
  const editable = !!rawEditable;

  const resume = {
    name,
    image,
    summary,
    location,
    employments,
    trainings,
    sideProjects,
    technologies,
  };

  return (
    <div className="resume">
      <Picture url={image} editable={editable} />
      <Name value={name} editable={editable} />
      <Summary value={summary} editable={editable} />
      <Location value={location} editable={editable} />
      <Experience
        employments={employments}
        editable={editable}
        onAddEmployment={(employment) =>
          onUpdate({
            ...resume,
            employments: addToCollection(employment, employments),
          })
        }
        onEditEmployment={(employment) =>
          onUpdate({
            ...resume,
            employments: updateCollection(employment, employments),
          })
        }
        onDeleteEmployment={(employment) =>
          onUpdate({
            ...resume,
            employments: removeFromCollection(employment, employments),
          })
        }
      />
      <Education trainings={trainings} editable={editable} />
      <SideHustle projects={sideProjects} editable={editable} />
      <TechnologyStack technologies={technologies} editable={editable} />
    </div>
  );
}

function Picture({ url, editable }: { url?: string; editable: boolean }) {
  if (url === undefined) {
    if (editable) {
      return (
        <div>
          <div
            className="resume__picture-placeholder"
            onClick={() => {
              alert("clicked");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-incognito"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M4.736 1.968l-.892 3.269-.014.058C2.113 5.568 1 6.006 1 6.5 1 7.328 4.134 8 8 8s7-.672 7-1.5c0-.494-1.113-.932-2.83-1.205a1.032 1.032 0 00-.014-.058l-.892-3.27c-.146-.533-.698-.849-1.239-.734C9.411 1.363 8.62 1.5 8 1.5c-.62 0-1.411-.136-2.025-.267-.541-.115-1.093.2-1.239.735zm.015 3.867a.25.25 0 01.274-.224c.9.092 1.91.143 2.975.143a29.58 29.58 0 002.975-.143.25.25 0 01.05.498c-.918.093-1.944.145-3.025.145s-2.107-.052-3.025-.145a.25.25 0 01-.224-.274zM3.5 10h2a.5.5 0 01.5.5v1a1.5 1.5 0 01-3 0v-1a.5.5 0 01.5-.5zm-1.5.5c0-.175.03-.344.085-.5H2a.5.5 0 010-1h3.5a1.5 1.5 0 011.488 1.312 3.5 3.5 0 012.024 0A1.5 1.5 0 0110.5 9H14a.5.5 0 010 1h-.085c.055.156.085.325.085.5v1a2.5 2.5 0 01-5 0v-.14l-.21-.07a2.5 2.5 0 00-1.58 0l-.21.07v.14a2.5 2.5 0 01-5 0v-1zm8.5-.5h2a.5.5 0 01.5.5v1a1.5 1.5 0 01-3 0v-1a.5.5 0 01.5-.5z"
              ></path>
            </svg>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  return <Avatar url={url} />;
}

function Name({ value, editable }: { value?: string; editable: boolean }) {
  if (value === undefined) {
    if (editable) {
      return (
        <h1
          className="resume__name resume__name--blank"
          onClick={() => {
            alert("clicked");
          }}
        >
          John Doe
        </h1>
      );
    } else {
      return null;
    }
  }

  return <h1 className="resume__name">{value}</h1>;
}

function Summary({ value, editable }: { value?: string; editable: boolean }) {
  if (value === undefined) {
    if (editable) {
      return (
        <div className="resume__summary">
          <Blank
            title="Add a summary"
            description="This here is a description about the section"
            onClick={() => {
              alert("clicked");
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  return <div className="resume__summary">{value}</div>;
}

function Location({
  value,
  editable,
}: {
  value?: Location;
  editable: boolean;
}) {
  if (value === undefined) {
    if (editable) {
      return (
        <Section title="Location" blank>
          <Blank
            title="Add a location"
            description="This here is a description about the section"
            onClick={() => {
              alert("clicked");
            }}
          />
        </Section>
      );
    } else {
      return null;
    }
  }

  const { city, country } = value;

  return (
    <Section title="Location">
      <p>{`${city}, ${country}`}</p>
    </Section>
  );
}

function Experience({
  employments,
  editable,
  onAddEmployment,
  onEditEmployment,
  onDeleteEmployment,
}: {
  employments?: Employment[];
  editable: boolean;
  onAddEmployment: (employment: Employment) => void;
  onEditEmployment: (employment: PersistedEmployment) => void;
  onDeleteEmployment: (employment: PersistedEmployment) => void;
}) {
  const { showModal, hideModal } = useModal();

  if (employments === undefined || employments.length === 0) {
    if (editable) {
      return (
        <Section title="Experience" blank>
          <Blank
            title="Add an employment"
            description="This here is a description about the section"
            onClick={() => {
              showModal(
                <EmploymentFormModal
                  onSubmit={(newEmployment) => {
                    onAddEmployment(newEmployment);
                    hideModal();
                  }}
                  onCancel={() => {
                    hideModal();
                  }}
                />
              );
            }}
          />
        </Section>
      );
    } else {
      return null;
    }
  }

  return (
    <Section title="Experience">
      <Timeline
        startingYear={startingYear(employments)}
        newEventButton={{
          title: "Add an employment",
          description: "This here is a description about the section",
          onClick: () => {
            showModal(
              <EmploymentFormModal
                onSubmit={(newEmployment) => {
                  onAddEmployment(newEmployment);
                  hideModal();
                }}
                onCancel={() => {
                  hideModal();
                }}
              />
            );
          },
        }}
      >
        {employments.map((employment, index) => (
          <li key={employment.employer.name}>
            <div className="timeline__event__summary">
              <h3>{employment.employer.name}</h3>
              <aside className="timeline__dot" />
              {employment.employer.website && (
                <a
                  href={employment.employer.website}
                  target="_blank"
                  rel="nofollow"
                >
                  {employment.employer.website}
                </a>
              )}
              <div className="timeline__period">
                <Period value={employment.period} />
              </div>
            </div>
            <div className="timeline__event__details employment">
              <div className="employment__summary">
                {employment.summary ??
                  "The employment summary is missing or cannot be parsed"}
                <Control
                  onEdit={() =>
                    showModal(
                      <EmploymentFormModal
                        employment={{ index, ...employment }}
                        onSubmit={(updatedEmployment) => {
                          if (!isPersisted(updatedEmployment))
                            throw new Error(
                              "Cannot update unpersisted employment"
                            );

                          onEditEmployment(updatedEmployment);
                          hideModal();
                        }}
                        onCancel={() => {
                          hideModal();
                        }}
                      />
                    )
                  }
                  onDelete={() =>
                    showModal(
                      <ConfirmationModal
                        question="Are you sure that you want to delete this employment?"
                        onConfirm={() => {
                          onDeleteEmployment({ index, ...employment });
                          hideModal();
                        }}
                        onDecline={() => hideModal()}
                      />
                    )
                  }
                />
              </div>
              {employment.roles && employment.roles.length > 0 && (
                <ul>
                  {employment.roles.map((role) => (
                    <li key={role.title} className="enployment__role">
                      <h4>{role.title}</h4>
                      <p>
                        {role.summary}
                        <Control
                          onEdit={() => showModal(
                            <RoleFormModal
                              role={{ index, ...role }}
                              onSubmit={(updatedRole) => {
                                if (!isPersisted(updatedRole))
                                  throw new Error(
                                    "Cannot update unpersisted employment"
                                  );

                                onEditEmployment({...employment, index, roles: updateCollection(updatedRole, employment.roles) })
                                hideModal();
                              }}
                              onCancel={() => {
                                hideModal();
                              }}
                            />
                          ) }
                          onDelete={() =>                     showModal(
                            <ConfirmationModal
                              question="Are you sure that you want to delete this role?"
                              onConfirm={() => {
                                onEditEmployment({...employment, index, roles: removeFromCollection({...role, index}, employment.roles) })
                                hideModal();
                              }}
                              onDecline={() => hideModal()}
                            />
                          ) }
                        />
                      </p>
                      {role.majorAchievements &&
                        role.majorAchievements.length > 0 && (
                          <>
                            <aside>Major achievements:</aside>
                            <ul>
                              {role.majorAchievements?.map((achievement) => (
                                <li
                                  key={achievement.title}
                                  className="enployment__achievement"
                                >
                                  <h5>{achievement.title}</h5>
                                  <p>{achievement.summary}</p>
                                  <ul>
                                    {achievement.technologies.map(
                                      (technology) => (
                                        <li key={technology}>
                                          <span className="badge">
                                            {technology}
                                          </span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                    </li>
                  ))}
                </ul>
              )}
              {editable && (
                <Blank
                  title="Add a role"
                  description="This here is a description about the section"
                  style="compact"
                  onClick={() => {
                    showModal(
                      <RoleFormModal
                        onSubmit={(newRole) => {
                          onEditEmployment({...employment, index, roles: addToCollection(newRole, employment.roles) })
                          hideModal();
                        }}
                        onCancel={() => hideModal()}
                      />
                    );
                  }}
                />
              )}
            </div>
          </li>
        ))}
      </Timeline>
    </Section>
  );
}

type EmploymentForm = {
  name: string;
  website: string | null;
  from: MonthAndYear | null;
  to: MonthAndYear | null;
  summary: string;
};

type RoleForm = {
  title: string;
  summary: string;
};

function Period({ value }: { value: Period }) {
  const from = value.from.toFormattedString();
  const to = value.to !== null ? value.to.toFormattedString() : "Present";

  return (
    <>
      {from} - {to}
    </>
  );
}

function ConfirmationModal({
  question,
  onConfirm,
  onDecline,
}: {
  question: string;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  return (
    <div>
      <header>
        <strong>Are you sure?</strong>
      </header>
      <section>
        <p>{question}</p>
      </section>
      <footer>
        <button type="button" className="button" onClick={onDecline}>
          No
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onConfirm}
        >
          Yes
        </button>
      </footer>
    </div>
  );
}

function EmploymentFormModal({
  employment: initialEmployment,
  onSubmit,
  onCancel,
}: {
  employment?: EditableEmployment;
  onSubmit: (employment: EditableEmployment) => void;
  onCancel: () => void;
}) {
  const [ongoing, setOngoing] = useState<boolean>(
    isPersisted(initialEmployment)
      ? initialEmployment.period.to === null
      : false
  );

  const form = useForm<EmploymentForm>({
    name: {
      value: initialEmployment?.employer.name ?? "",
      validations: [validatePresence],
    },
    website: {
      value: initialEmployment?.employer.website ?? "",
      validations: [validatePresence],
    },
    from: {
      value: initialEmployment?.period.from ?? null,
      validations: [validatePresence],
    },
    to: {
      value: initialEmployment?.period.to ?? null,
      validations: [validatePresence],
      validateUnless: ongoing,
    },
    summary: {
      value: initialEmployment?.summary ?? "",
      validations: [validatePresence],
    },
  });

  return (
    <div>
      <header>
        <strong>
          {isPersisted(initialEmployment) ? "Edit" : "Add"} employment
        </strong>
      </header>
      <section>
        <FormTextInput
          form={form}
          name="name"
          label="Name"
          placeholder="The name of your employer."
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
      </section>
      <footer>
        <button type="button" className="button" onClick={onCancel}>
          Close
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            if (!form.validate()) return;
            if (
              !form.values.name ||
              !form.values.website ||
              !form.values.from ||
              !form.values.summary
            )
              return;

            onSubmit({
              ...initialEmployment,
              employer: {
                name: form.values.name,
                website: addProtocol(form.values.website),
              },
              period: { from: form.values.from, to: form.values.to },
              summary: form.values.summary,
            });
          }}
        >
          {isPersisted(initialEmployment) ? "Update" : "Add"}
        </button>
      </footer>
    </div>
  );
}

function RoleFormModal({
  role: initialRole,
  onSubmit,
  onCancel,
}: {
  role?: EditableRole;
  onSubmit: (role: EditableRole) => void;
  onCancel: () => void;
}) {
  const form = useForm<RoleForm>({
    title: {
      value: initialRole?.title ?? "",
      validations: [validatePresence],
    },
    summary: {
      value: initialRole?.summary ?? "",
      validations: [validatePresence],
    },
  });

  return (
    <div>
      <header>
        <strong>Add role</strong>
      </header>
      <section>
        <FormTextInput
          form={form}
          name="title"
          label="Title"
          placeholder="Your role's title"
        />
        <FormTextAreaInput
          form={form}
          name="summary"
          label="Summary"
          placeholder="Summarize your role and responsibilities."
        />
      </section>
      <footer>
        <button type="button" className="button" onClick={onCancel}>
          Close
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            if (!form.validate()) return;
            if (
              !form.values.title ||
              !form.values.summary
            )
              return;

            onSubmit({
              ...initialRole,
              title: form.values.title,
              summary: form.values.summary,
            });
          }}
        >
          Add
        </button>
      </footer>
    </div>
  );
}

function Education({
  trainings,
  editable,
}: {
  trainings?: Training[];
  editable: boolean;
}) {
  return (
    <EditableTimelineSection
      collection={trainings}
      editable={editable}
      sectionTitle="Education"
      placeholder={{
        title: "Add a training",
        description: "This here is a description about the section",
      }}
      renderEntry={(training: Training) => (
        <TimelineEvent
          key={training.institution.name}
          title={training.institution.name}
          website={training.institution.website}
          period={training.period}
        >
          {training.summary}
        </TimelineEvent>
      )}
    />
  );
}

function SideHustle({
  projects,
  editable,
}: {
  projects?: SideProject[];
  editable: boolean;
}) {
  return (
    <EditableTimelineSection
      collection={projects}
      editable={editable}
      sectionTitle="Side projects"
      placeholder={{
        title: "Add a side project",
        description: "This here is a description about the section",
      }}
      renderEntry={(project: SideProject) => (
        <TimelineEvent
          key={project.name}
          title={project.name}
          website={project.website}
          period={project.period}
        >
          {project.summary}
        </TimelineEvent>
      )}
    />
  );
}

function TechnologyStack({
  technologies,
  editable,
}: {
  technologies?: Technology[];
  editable: boolean;
}) {
  return (
    <EditableSection
      collection={technologies}
      editable={editable}
      sectionTitle="Technologies"
      placeholder={{
        title: "Add a technology",
        description: "This here is a description about the section",
      }}
    >
      {technologies && technologies.length > 0 && (
        <div className="technology-stack">
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Task complexity</th>
                <th>Knowledge of features</th>
                <th>Knowledge of best practices</th>
                <th>Can mentor others?</th>
                <th>Used recently?</th>
              </tr>
            </thead>
            <tbody>
              {technologies.map((technology) => (
                <tr key={technology.name}>
                  <th>
                    <a
                      href={addProtocol(technology.website)}
                      target="_blank"
                      rel="nofollow"
                    >
                      {technology.name}
                    </a>
                  </th>
                  <td>{capitalize(technology.taskComplexity)}</td>
                  <td>{capitalize(technology.knowledgeOfFeatures)}</td>
                  <td>{capitalize(technology.knowledgeOfBestPractices)}</td>
                  <td>{technology.canMentor ? "Yes" : "No"}</td>
                  <td>{technology.recentlyUsed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </EditableSection>
  );
}

function EditableSection<T>({
  collection,
  editable,
  sectionTitle,
  placeholder,
  children,
}: {
  collection?: T[];
  editable: boolean;
  sectionTitle: string;
  placeholder: { title: string; description: string };
  children: ReactNode;
}) {
  if (collection === undefined || collection.length === 0) {
    if (editable) {
      return (
        <Section title={sectionTitle} blank>
          <Blank
            {...placeholder}
            onClick={() => {
              alert("clicked");
            }}
          />
        </Section>
      );
    } else {
      return null;
    }
  }

  return <Section title={sectionTitle}>{children}</Section>;
}

function EditableTimelineSection<T extends { period: Period }>({
  collection,
  editable,
  sectionTitle,
  placeholder,
  renderEntry,
}: {
  collection?: T[];
  editable: boolean;
  sectionTitle: string;
  placeholder: { title: string; description: string };
  renderEntry: (entry: T) => ReactNode;
}) {
  return (
    <EditableSection
      collection={collection}
      editable={editable}
      sectionTitle={sectionTitle}
      placeholder={placeholder}
    >
      {collection && collection.length > 0 && (
        <Timeline
          startingYear={startingYear(collection)}
          newEventButton={{
            title: "Foo",
            description: "Bar",
            onClick: () => alert("baz"),
          }}
        >
          {collection.map(renderEntry)}
        </Timeline>
      )}
    </EditableSection>
  );
}

function isPersisted(object?: Persistable | {}): object is Persistable {
  return object !== undefined && "index" in object;
}

export function parseResume(raw: any) {
  const parsed = JSON.parse(raw);

  const resume: Resume = {};

  if ("image" in parsed) {
    resume.image = parsed.image;
  }

  if ("name" in parsed) {
    resume.name = parsed.name;
  }

  if ("summary" in parsed) {
    resume.summary = parsed.summary;
  }

  if ("location" in parsed) {
    resume.location = {
      city: parsed.location.city,
      country: parsed.location.country,
    };
  }

  if ("employments" in parsed && Array.isArray(parsed.employments)) {
    parsed.employments.forEach((entry: any) => {
      let roles: Role[] = [];

      if ("roles" in entry && Array.isArray(entry.roles)) {
        roles = entry.roles.map(parseRole);
      }

      const employment: Employment = {
        summary: "summary" in entry ? entry.summary : null,
        employer: parseEmployer(entry.employer),
        period: parsePeriod(entry.period),
        roles,
      };

      resume.employments = [...(resume.employments ?? []), employment];
    });
  }

  if ("trainings" in parsed && Array.isArray(parsed.trainings)) {
    parsed.trainings.forEach((entry: any) => {
      const training: Training = {
        institution: parseInstitution(entry.institution),
        summary: "summary" in entry ? entry.summary : null,
        period: parsePeriod(entry.period),
      };

      resume.trainings = [...(resume.trainings ?? []), training];
    });
  }

  if ("sideProjects" in parsed && Array.isArray(parsed.sideProjects)) {
    parsed.sideProjects.forEach((entry: any) => {
      const project: SideProject = {
        name: "name" in entry ? entry.name : null,
        website: "website" in entry ? entry.website : null,
        online: "online" in entry ? entry.online : null,
        summary: "summary" in entry ? entry.summary : null,
        period: parsePeriod(entry.period),
      };

      resume.sideProjects = [...(resume.sideProjects ?? []), project];
    });
  }

  if ("technologies" in parsed && Array.isArray(parsed.technologies)) {
    parsed.technologies.forEach((entry: any) => {
      const technology: Technology = {
        name: "name" in entry ? entry.name : null,
        website: "website" in entry ? entry.website : null,
        recentlyUsed: "recentlyUsed" in entry ? entry.recentlyUsed : null,
        canMentor: "canMentor" in entry ? entry.canMentor : null,
        taskComplexity: "taskComplexity" in entry ? entry.taskComplexity : null,
        knowledgeOfBestPractices:
          "knowledgeOfBestPractices" in entry
            ? entry.knowledgeOfBestPractices
            : null,
        knowledgeOfFeatures:
          "knowledgeOfFeatures" in entry ? entry.knowledgeOfFeatures : null,
      };

      resume.technologies = [...(resume.technologies ?? []), technology];
    });
  }

  return resume;
}

function parseInstitution(raw: any) {
  const institution: Institution = {
    name: "Unknown",
  };

  if ("name" in raw) {
    institution.name = raw.name;
  }

  if ("website" in raw) {
    institution.website = raw.website;
  }

  return institution;
}

function parseRole(raw: any) {
  let majorAchievements: Achievement[] = [];

  if ("majorAchievements" in raw && Array.isArray(raw.majorAchievements)) {
    majorAchievements = raw.majorAchievements.map(parseAchievement);
  }

  const role: Role = {
    title: "Unknown",
    summary: "Could not parse role summary",
    majorAchievements,
  };

  if ("title" in raw) {
    role.title = raw.title;
  }

  if ("summary" in raw) {
    role.summary = raw.summary;
  }

  return role;
}

function parseAchievement(raw: any) {
  const achievement: Achievement = {
    title: "Unknown",
    summary: "Could not parse achievement summary",
    technologies: [],
  };

  if ("title" in raw) {
    achievement.title = raw.title;
  }

  if ("summary" in raw) {
    achievement.summary = raw.summary;
  }

  if ("technologies" in raw && Array.isArray(raw.technologies)) {
    let technologies: string[] = [];
    raw.technologies.forEach((entry: unknown) => {
      if (typeof entry === "string") technologies = [...technologies, entry];
    });
    achievement.technologies = technologies;
  }

  return achievement;
}

function parseEmployer(raw: any) {
  const employer: Employer = { name: "Unknown" };

  if (!raw) return employer;

  if ("name" in raw) {
    employer.name = raw.name;
  }

  if ("website" in raw) {
    employer.website = raw.website;
  }

  return employer;
}

function parsePeriod(raw: any) {
  const period: Period = { from: MonthAndYear.current(), to: null };

  if ("from" in raw) {
    const from = MonthAndYear.parse(raw.from);
    if (from) period.from = from;
  }

  if ("to" in raw) {
    const to = MonthAndYear.parse(raw.to);
    if (to) period.to = to;
  }

  return period;
}

function Control({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="management-controls">
      <a onClick={onEdit}>Edit</a>
      <a onClick={onDelete}>Delete</a>
    </div>
  );
}

function addToCollection<T>(item: T, collection?: T[]) {
  if (collection && collection.length > 0) {
    return [...collection, { ...item, index: collection.length }];
  } else {
    return [item];
  }
}

function removeFromCollection<T, U extends T & Persistable>(
  item: U,
  collection?: T[]
) {
  if (collection === undefined)
    throw new Error("Cannot update collection that does not exist");

  if (collection.length === 0)
    throw new Error("Cannot remove elements from an empty collection");

  if (collection.length === 1) {
    return [];
  } else {
    return [
      ...collection.slice(0, item.index),
      ...collection.slice(item.index + 1),
    ];
  }
}

function updateCollection<T, U extends T & Persistable>(
  item: U,
  collection?: T[]
) {
  if (collection === undefined)
    throw new Error("Cannot update collection that does not exist");

  if (collection.length > 0) {
    return [
      ...collection.slice(0, item.index),
      item,
      ...collection.slice(item.index + 1),
    ];
  } else {
    return [item];
  }
}
