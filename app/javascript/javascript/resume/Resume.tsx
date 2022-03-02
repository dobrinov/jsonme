import React, { ReactNode } from "react";
import { addProtocol, capitalize, startingYear } from "../utils";
import { Avatar } from "../Avatar";
import { Section } from "./Section";
import { Timeline, TimelineEvent } from "./Timeline";
import { EmptyCollectionButton } from "./EmptyCollectionButton";

type Period = { from: string; to: string | null };

type Employer = {
  name: string;
  website: string;
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

type Resume = {
  name?: string;
  summary?: string;
  image?: string;
  location?: Location;
  employments?: Employment[];
  trainings?: Training[];
  sideProjects?: SideProject[];
  technologies?: Technology[];
};

type EditableResume = { editable?: boolean } & Resume;

export function parseResume(raw: any) {
  return JSON.parse(raw) as Resume;
}

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
}: EditableResume) {
  const editable = !!rawEditable;

  return (
    <div className="resume">
      <Picture url={image} editable={editable} />
      <Name value={name} editable={editable} />
      <Summary value={summary} editable={editable} />
      <Location value={location} editable={editable} />
      <Experience employments={employments} editable={editable} />
      <Education trainings={trainings} editable={editable} />
      <SideHustle projects={sideProjects} editable={editable} />
      <TechnologyStack technologies={technologies} editable={editable} />
    </div>
  );
}

function Picture({ url, editable }: { url?: string; editable: boolean }) {
  if (url === undefined) {
    if (editable) {
      return <p>PICTURE PLACEHOLDER</p>;
    } else {
      return null;
    }
  }

  return <Avatar url={url} />;
}

function Name({ value, editable }: { value?: string; editable: boolean }) {
  if (value === undefined) {
    if (editable) {
      return <p>NAME PLACEHOLDER</p>;
    } else {
      return null;
    }
  }

  return <h1 className="resume__name">{value}</h1>;
}

function Summary({ value, editable }: { value?: string; editable: boolean }) {
  if (value === undefined) {
    if (editable) {
      return <p>SUMMARY PLACEHOLDER</p>;
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
      return <p>LOCATION PLACEHOLDER</p>;
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
}: {
  employments?: Employment[];
  editable: boolean;
}) {
  if (employments === undefined || employments.length === 0) {
    if (editable) {
      return (
        <Section title="Experience" isPlaceholder>
          <EmptyCollectionButton
            title="Add an employment"
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

  return (
    <Section title="Experience">
      <Timeline startingYear={startingYear(employments)}>
        {employments.map((employment) => (
          <TimelineEvent
            key={employment.employer.name}
            title={employment.employer.name}
            website={employment.employer.website}
            period={employment.period}
            className="employment"
          >
            <p>{employment.summary}</p>
            <Roles roles={employment.roles} />
          </TimelineEvent>
        ))}
      </Timeline>
    </Section>
  );
}

function Roles({ roles }: { roles?: Role[] }) {
  if (!roles) return null;

  return (
    <ul>
      {roles.map((role) => (
        <li key={role.title} className="enployment__role">
          <h4>{role.title}</h4>
          <p>{role.summary}</p>
          {role.majorAchievements && role.majorAchievements.length > 0 && (
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
                      {achievement.technologies.map((technology) => (
                        <li key={technology}>
                          <span className="badge">{technology}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}
        </li>
      ))}
    </ul>
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
        <Section title={sectionTitle} isPlaceholder>
          <EmptyCollectionButton
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

function EditableTimelineSection<T extends { period: { from: string } }>({
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
        <Timeline startingYear={startingYear(collection)}>
          {collection.map(renderEntry)}
        </Timeline>
      )}
    </EditableSection>
  );
}
