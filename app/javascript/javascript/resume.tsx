import React, { useEffect, useState } from "react";
import { Period } from "./time";
import { capitalize, startingYear } from "./utils";

type Employer = {
  name: string;
  website: string;
};

type Achievement = {
  title: string;
  summary: string;
  technologies: string[];
};

type Role = {
  title: string;
  summary: string;
  majorAchievements?: Achievement[];
};

type Employment = {
  summary: string;
  employer: Employer;
  period: Period;
  roles: Role[];
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

type Technology = {
  name: string;
  website: string;
  recentlyUsed: boolean;
  canMentor: boolean;
  knowledgeOfBestPractices: string;
  knowledgeOfFeatures: string;
  taskComplexity: string;
};

type SideProject = {
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
      {image && <ProfilePicture url={image} />}
      <h1 className="name">{name}</h1>
      <div className="summary">{summary}</div>

      {location && (
        <div className="section">
          <h2 className="heading">Location</h2>
          <p>{`${location.city}, ${location.country}`}</p>
        </div>
      )}

      {employments && (
        <div className="section">
          <h2 className="heading">Experience</h2>
          <div className="timeline">
            <aside>present</aside>
            <div>
              <ul>
                {employments.map((employment) => (
                  <li>
                    <div className="period">
                      <h3>{employment.employer.name}</h3>
                      <aside />
                      <a
                        href={employment.employer.website}
                        target="_blank"
                        rel="nofollow"
                      >
                        {employment.employer.website}
                      </a>
                      <div>{employment.period.toString()}</div>
                    </div>
                    <div className="employment">
                      <p>{employment.summary}</p>
                      <ul>
                        {employment.roles.map((role) => (
                          <li className="role">
                            <h4>{role.title}</h4>
                            <p>{role.summary}</p>
                            <aside>Major achievements:</aside>
                            <ul>
                              {role.majorAchievements?.map((achievement) => (
                                <li className="achievement">
                                  <h5>{achievement.title}</h5>
                                  <p>{achievement.summary}</p>
                                  <ul>
                                    {achievement.technologies.map(
                                      (technology) => (
                                        <li>{technology}</li>
                                      )
                                    )}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <aside>{startingYear(employments)}</aside>
          </div>
        </div>
      )}

      {trainings && trainings.length > 0 && (
        <div className="section">
          <h2 className="heading">Education</h2>
          <div className="timeline">
            <aside>present</aside>
            <div>
              <ul>
                {trainings.map((training) => (
                  <li>
                    <div className="period">
                      <h3>{training.institution.name}</h3>
                      <aside />
                      <a
                        href={training.institution.website}
                        target="_blank"
                        rel="nofollow"
                      >
                        {training.institution.website}
                      </a>
                      <div>{training.period.toString()}</div>
                    </div>
                    <p>{training.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
            <aside>{startingYear(trainings)}</aside>
          </div>
        </div>
      )}

      {sideProjects && (
        <div className="section">
          <h2 className="heading">Side projects</h2>
          <div className="timeline">
            <aside>present</aside>
            <div>
              <ul>
                {sideProjects.map((sideProject) => (
                  <li>
                    <div className="period">
                      <h3>{sideProject.name}</h3>
                      <aside />
                      <a
                        href={sideProject.website}
                        target="_blank"
                        rel="nofollow"
                      >
                        {sideProject.website}
                      </a>
                      <div>{sideProject.period.toString()}</div>
                    </div>
                    <p>{sideProject.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
            <aside>{startingYear(sideProjects)}</aside>
          </div>
        </div>
      )}

      {technologies && (
        <div className="section">
          <h2 className="heading">Technologies</h2>
          <p>self evaluation</p>

          <div className="responsive-table">
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
                        href={technology.website}
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
        </div>
      )}
    </div>
  );
}

function ProfilePicture({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const image = hasError ? "whitenoice.gif" : url;

  return (
    <div className="profile-picture">
      <img src={image} onError={() => setHasError(true)}></img>
    </div>
  );
}
