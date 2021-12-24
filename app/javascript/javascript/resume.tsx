import React from "react";

type MonthAndYear = {
  month: number;
  year: number;
};

type Period = {
  from: string;
  to: string;
};

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

type Resume = {
  name: string;
  image: string;
  summary: string;
  location?: Location;
  employments?: Employment[];
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
}: Resume) {
  console.log(name);
  return (
    <div className="resume">
      <div className="profile-picture">
        <img src={image}></img>
      </div>
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
                      <div>{stringifyPeriod(employment.period)}</div>
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
            <aside>{firstEmploymentYear(employments)}</aside>
          </div>
        </div>
      )}
    </div>
  );
}

function firstEmploymentYear(employments: Employment[]) {
  let year: number | undefined = undefined;

  employments.forEach((employment) => {
    const currentYear = parseInt(employment.period.from.split("-")[1]);

    if (year) {
      year = year < currentYear ? year : currentYear;
    } else {
      year = currentYear;
    }
  });

  return year;
}

function stringifyPeriod(period: Period) {
  return `${stringifyMonthAndYear(period.from)} - ${stringifyMonthAndYear(
    period.to
  )}`;
}

function stringifyMonthAndYear(value: string) {
  if (value) {
    const [month, year] = value.split("-");

    return new Date(parseInt(year), parseInt(month)).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
      }
    );
  } else {
    return "Present";
  }
}
