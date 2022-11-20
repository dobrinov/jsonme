import {ReactNode} from 'react'

type Resume = {
  name?: string
  summary?: string
  image?: string
  location?: Location
  employments?: Employment[]
  trainings?: Training[]
  sideProjects?: SideProject[]
  technologies?: Technology[]
}

type Period = {from: MonthAndYear; to: MonthAndYear | null}

type Employer = {
  name: string
  website?: string
}

type Achievement = {
  title: string
  summary: string
  technologies?: string[]
}

type Role = {
  title: string
  summary?: string
  majorAchievements?: Achievement[]
}

type Employment = {
  summary: string
  employer: Employer
  period: Period
  roles?: Role[]
}

type Location = {
  city: string
  state?: string
  country: string
}

type Institution = {
  name: string
  website?: string
}

type Training = {
  institution: Institution
  summary: string
  period: Period
}

type Complexity = 'easy' | 'intermediate' | 'hard'
type Knowledge = 'poor' | 'average' | 'good'
type YesNo = 'yes' | 'no'

type Technology = {
  name: string
  website: string
  recentlyUsed: YesNo
  canMentor: YesNo
  knowledgeOfBestPractices: Knowledge
  knowledgeOfFeatures: Knowledge
  taskComplexity: Complexity
}

type SideProject = {
  name: string
  website: string
  online: boolean
  period: Period
  summary: string
}

export function ResumeParser({json}: {json: string}) {
  const resume = parse(json)
  return <Resume {...resume} />
}

function Resume({image, name, summary, location, employments, trainings, sideProjects, technologies}: Resume) {
  return (
    <>
      {image && (
        <div className="profile-picture">
          <img src={image} />
        </div>
      )}

      {name && <h1 className="name">{name}</h1>}

      {summary && <div className="summary">{summary}</div>}

      {location && (
        <Section title="Location">
          <p>
            {location.city}, {location.state}, {location.country}
          </p>
        </Section>
      )}

      {employments && employments.length > 0 && (
        <Section title="Experience">
          <Timeline startingYear={startingYear(employments)}>
            <ul>
              {employments.map(employment => (
                <li key={employment.employer.name}>
                  <div className="period">
                    <h3>{employment.employer.name}</h3>
                    <aside />
                    <a href={employment.employer.website} target="_blank" rel="nofollow">
                      {employment.employer.website}
                    </a>
                    <div>
                      <Period value={employment.period} />
                    </div>
                  </div>
                  <div className="employment">
                    <p>{employment.summary}</p>
                    {employment.roles && employment.roles.length > 0 && (
                      <ul>
                        {employment.roles.map(role => (
                          <li key={role.title} className="role">
                            <h4>{role.title}</h4>
                            {role.summary && <p>{role.summary}</p>}
                            {role.majorAchievements && role.majorAchievements.length > 0 && (
                              <>
                                <aside>Major achievements:</aside>
                                <ul>
                                  {role.majorAchievements.map(achievement => (
                                    <li key={achievement.title} className="achievement">
                                      <h5>{achievement.title}</h5>
                                      <p>{achievement.summary}</p>
                                      {achievement.technologies && achievement.technologies.length > 0 && (
                                        <ul>
                                          {achievement.technologies.map(technology => (
                                            <li key={technology}>{technology}</li>
                                          ))}
                                        </ul>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Timeline>
        </Section>
      )}
      {trainings && trainings.length > 0 && (
        <Section title="Education">
          <Timeline startingYear={startingYear(trainings)}>
            <ul>
              {trainings.map(training => (
                <li key={training.summary}>
                  <div className="period">
                    <h3>{training.institution.name}</h3>
                    {training.institution.website && (
                      <a href={training.institution.website} target="_blank" rel="nofollow">
                        {training.institution.website}
                      </a>
                    )}
                    <div>
                      <Period value={training.period} />
                    </div>
                  </div>
                  <p>{training.summary}</p>
                </li>
              ))}
            </ul>
          </Timeline>
        </Section>
      )}
      {sideProjects && sideProjects.length > 0 && (
        <Section title="Side projects">
          <Timeline startingYear={startingYear(sideProjects)}>
            <ul>
              {sideProjects.map(project => (
                <li key={project.name}>
                  <div className="period">
                    <h3>{project.name}</h3>
                    <aside />
                    {project.online ? (
                      <a href={project.website} target="_blank" rel="nofollow">
                        {project.website}
                      </a>
                    ) : (
                      <span className="offline">offline</span>
                    )}
                    <div>
                      <Period value={project.period} />
                    </div>
                  </div>
                  <p>{project.summary}</p>
                </li>
              ))}
            </ul>
          </Timeline>
        </Section>
      )}
      {technologies && technologies.length > 0 && (
        <Section title="Technologies">
          <p>self evaluation</p>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Task complexity</th>
                  <th>Knowledge of features</th>
                  <th>Knowledge of best practices</th>
                  <th>Can mentor others?</th>
                  <th>Used recently?</th>
                </tr>
              </thead>
              <tbody>
                {technologies.map(technology => (
                  <tr key={technology.name}>
                    <th>
                      <a href={technology.website} target="_blank" rel="nofollow">
                        {technology.name}
                      </a>
                    </th>
                    <td>{capitalize(technology.taskComplexity)}</td>
                    <td>{capitalize(technology.knowledgeOfFeatures)}</td>
                    <td>{capitalize(technology.knowledgeOfBestPractices)}</td>
                    <td>{technology.canMentor ? 'Yes' : 'No'}</td>
                    <td>{technology.recentlyUsed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </>
  )
}

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="section">
      <h2 className="heading">{title}</h2>
      {children}
    </div>
  )
}

function Timeline({startingYear, children}: {startingYear: number; children: ReactNode}) {
  return (
    <div className="timeline">
      <aside>present</aside>
      <div>{children}</div>
      <aside>{startingYear}</aside>
    </div>
  )
}

function Period({value}: {value: Period}) {
  const from = value.from.toFormattedString()
  const to = value.to !== null ? value.to.toFormattedString() : 'Present'

  return (
    <>
      {from} - {to}
    </>
  )
}

export function parse(raw: any) {
  const parsed = JSON.parse(raw)

  const resume: Resume = {}

  if ('image' in parsed) {
    resume.image = parsed.image
  }

  if ('name' in parsed) {
    resume.name = parsed.name
  }

  if ('summary' in parsed) {
    resume.summary = parsed.summary
  }

  if ('location' in parsed) {
    resume.location = {
      city: parsed.location.city,
      country: parsed.location.country
    }
  }

  if ('employments' in parsed && Array.isArray(parsed.employments)) {
    parsed.employments.forEach((entry: any) => {
      let roles: Role[] = []

      if ('roles' in entry && Array.isArray(entry.roles)) {
        roles = entry.roles.map(parseRole)
      }

      const employment: Employment = {
        summary: 'summary' in entry ? entry.summary : null,
        employer: parseEmployer(entry.employer),
        period: parsePeriod(entry.period),
        roles
      }

      resume.employments = [...(resume.employments ?? []), employment]
    })
  }

  if ('trainings' in parsed && Array.isArray(parsed.trainings)) {
    parsed.trainings.forEach((entry: any) => {
      const training: Training = {
        institution: parseInstitution(entry.institution),
        summary: 'summary' in entry ? entry.summary : null,
        period: parsePeriod(entry.period)
      }

      resume.trainings = [...(resume.trainings ?? []), training]
    })
  }

  if ('sideProjects' in parsed && Array.isArray(parsed.sideProjects)) {
    parsed.sideProjects.forEach((entry: any) => {
      const project: SideProject = {
        name: 'name' in entry ? entry.name : null,
        website: 'website' in entry ? entry.website : null,
        online: 'online' in entry ? entry.online : null,
        summary: 'summary' in entry ? entry.summary : null,
        period: parsePeriod(entry.period)
      }

      resume.sideProjects = [...(resume.sideProjects ?? []), project]
    })
  }

  if ('technologies' in parsed && Array.isArray(parsed.technologies)) {
    parsed.technologies.forEach((entry: any) => {
      const technology: Technology = {
        name: 'name' in entry ? entry.name : null,
        website: 'website' in entry ? entry.website : null,
        recentlyUsed: 'recentlyUsed' in entry ? entry.recentlyUsed : null,
        canMentor: 'canMentor' in entry ? entry.canMentor : null,
        taskComplexity: 'taskComplexity' in entry ? entry.taskComplexity : null,
        knowledgeOfBestPractices: 'knowledgeOfBestPractices' in entry ? entry.knowledgeOfBestPractices : null,
        knowledgeOfFeatures: 'knowledgeOfFeatures' in entry ? entry.knowledgeOfFeatures : null
      }

      resume.technologies = [...(resume.technologies ?? []), technology]
    })
  }

  return resume
}

function parseInstitution(raw: any) {
  const institution: Institution = {
    name: 'Unknown'
  }

  if ('name' in raw) {
    institution.name = raw.name
  }

  if ('website' in raw) {
    institution.website = raw.website
  }

  return institution
}

function parseRole(raw: any) {
  const title = 'title' in raw ? raw.title : 'Could not parse role title'
  const summary = 'summary' in raw ? raw.summary : undefined

  let majorAchievements: Achievement[] = []

  if ('majorAchievements' in raw && Array.isArray(raw.majorAchievements)) {
    majorAchievements = raw.majorAchievements.map(parseAchievement)
  }

  const role: Role = {
    title,
    summary,
    majorAchievements
  }

  return role
}

function parseAchievement(raw: any) {
  const achievement: Achievement = {
    title: 'Unknown',
    summary: 'Could not parse achievement summary',
    technologies: []
  }

  if ('title' in raw) {
    achievement.title = raw.title
  }

  if ('summary' in raw) {
    achievement.summary = raw.summary
  }

  if ('technologies' in raw && Array.isArray(raw.technologies)) {
    let technologies: string[] = []
    raw.technologies.forEach((entry: unknown) => {
      if (typeof entry === 'string') technologies = [...technologies, entry]
    })
    achievement.technologies = technologies
  }

  return achievement
}

function parseEmployer(raw: any) {
  const employer: Employer = {name: 'Unknown'}

  if (!raw) return employer

  if ('name' in raw) {
    employer.name = raw.name
  }

  if ('website' in raw) {
    employer.website = raw.website
  }

  return employer
}

function parsePeriod(raw: any) {
  const period: Period = {from: MonthAndYear.current(), to: null}

  if ('from' in raw) {
    const from = MonthAndYear.parse(raw.from)
    if (from) period.from = from
  }

  if ('to' in raw) {
    const to = MonthAndYear.parse(raw.to)
    if (to) period.to = to
  }

  return period
}

class MonthAndYear {
  month: number
  year: number

  static parse(value: string) {
    try {
      const [month, year] = value.split('-')

      return new MonthAndYear(parseInt(year), parseInt(month))
    } catch {
      return null
    }
  }

  static current() {
    const date = new Date()

    return new MonthAndYear(date.getFullYear(), date.getMonth() + 1)
  }

  constructor(year: number, month: number) {
    this.month = month
    this.year = year
  }

  isEqual(other: MonthAndYear): boolean {
    return this.year === other.year && this.month === other.month
  }

  isAfter(other: MonthAndYear): boolean {
    if (this.year > other.year) {
      return true
    } else if (this.year === other.year) {
      return this.month > other.month
    } else {
      return false
    }
  }

  isAfterOrEqual(other: MonthAndYear): boolean {
    if (this.isEqual(other)) return true
    return this.isAfter(other)
  }

  isBefore(other: MonthAndYear): boolean {
    if (this.year < other.year) {
      return true
    } else if (this.year === other.year) {
      return this.month < other.month
    } else {
      return false
    }
  }

  isBeforeOrEqual(other: MonthAndYear): boolean {
    if (this.isEqual(other)) return true
    return this.isBefore(other)
  }

  toDate(): Date {
    return new Date(this.year, this.month, 1)
  }

  toString(): string {
    return `${this.year}-${String(this.month).padStart(2, '0')}`
  }

  toFormattedString(): string {
    return this.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }
}

function startingYear(temporals: {period: Period}[]) {
  return Math.min(...temporals.map(temporal => temporal.period.from.year))
}

const capitalize = (value: string) => {
  return value[0].toUpperCase() + value.slice(1)
}
