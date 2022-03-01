import React from "react";
import { addProtocol, capitalize, startingYear } from "../utils";
import { Avatar } from "../Avatar";
import { Section } from "./Section";
import { Timeline, TimelineEvent } from "./Timeline";
import { Name } from "./Name";
import { Summary } from "./Summary";

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
  name: string;
  summary: string;
  image?: string;
  location?: Location;
  employments?: Employment[];
  trainings?: Training[];
  sideProjects?: SideProject[];
  technologies?: Technology[];
};

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
}: Resume) {
  return (
    <div className="resume">
      <Avatar url={image} />
      <Name value={name} />
      <Summary value={summary} />

      {location && (
        <Section title="Location">
          <p>{`${location.city}, ${location.country}`}</p>
        </Section>
      )}

      {employments && employments.length > 0 && (
        <Section title="Experience">
          <Timeline startingYear={startingYear(employments)}>
            {employments.map((employment) => (
              <TimelineEvent
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
      )}

      {trainings && trainings.length > 0 && (
        <Section title="Education">
          <Timeline startingYear={startingYear(trainings)}>
            {trainings.map((training) => (
              <TimelineEvent
                title={training.institution.name}
                website={training.institution.website}
                period={training.period}
              >
                {training.summary}
              </TimelineEvent>
            ))}
          </Timeline>
        </Section>
      )}

      {sideProjects && sideProjects.length > 0 && (
        <Section title="Side projects">
          <Timeline startingYear={startingYear(sideProjects)}>
            {sideProjects.map((sideProject) => (
              <TimelineEvent
                title={sideProject.name}
                website={sideProject.website}
                period={sideProject.period}
              >
                {sideProject.summary}
              </TimelineEvent>
            ))}
          </Timeline>
        </Section>
      )}

      {technologies && technologies.length > 0 && (
        <Section title="Technologies" subtitle="self evaluation">
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
                  <tr>
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
        </Section>
      )}
    </div>
  );
}

function Roles({ roles }: { roles?: Role[] }) {
  if (!roles) return null;

  return (
    <ul>
      {roles.map((role) => (
        <li className="enployment__role">
          <h4>{role.title}</h4>
          <p>{role.summary}</p>
          {role.majorAchievements && role.majorAchievements.length > 0 && (
            <>
              <aside>Major achievements:</aside>
              <ul>
                {role.majorAchievements?.map((achievement) => (
                  <li className="enployment__achievement">
                    <h5>{achievement.title}</h5>
                    <p>{achievement.summary}</p>
                    <ul>
                      {achievement.technologies.map((technology) => (
                        <li>
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
