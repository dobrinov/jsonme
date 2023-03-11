export type ParseResult<T> = T | UnsuccessfulParse<T>
type UnsuccessfulParse<T> = {type: 'unsuccessfulParse'; failure?: string} & {[K in keyof T]?: string}
type FieldParseError = {error: string}
type FieldParseResult<T> = T | FieldParseError

export type Person = {name?: string; image?: string}
export type Post = {title?: string; date?: Date; body?: string}
export type Location = {city?: string; state?: string; country?: string}

export type Achievement = {
  title: string
  summary: string
  technologies?: string[]
}

export type Role = {
  title: string
  summary?: string
  majorAchievements?: Achievement[]
}

export type Employer = {
  name: string
  website?: string
}

export type LegacyEmployment = {
  summary?: string
}

export type Resume = Person & {summary?: string; location?: Location; employments?: ParseResult<Employment>[]}

export class MonthAndYear {
  static parse(value: unknown): ParseResult<MonthAndYear> | null {
    if (value === null) return null
    if (typeof value !== 'string') return {type: 'unsuccessfulParse', failure: 'Period must be a string'}

    const splitResult = value.split('-')

    const month = parseInt(splitResult[0], 10)
    const year = parseInt(splitResult[1], 10)

    if (isNaN(month) || month < 1 || month > 12) {
      return {type: 'unsuccessfulParse', failure: `${splitResult[0]} is not a valid month`}
    }

    if (isNaN(year)) {
      return {type: 'unsuccessfulParse', failure: `${splitResult[1]} is not a valid year`}
    }

    return new MonthAndYear(year, month)
  }

  constructor(public year: number, public month: number) {}
}

export class Employment {
  summary: string
  period: Period

  static parse(value: unknown): ParseResult<Employment> {
    if (value === null || !isObject(value)) return {type: 'unsuccessfulParse', failure: 'Employment must be an object'}

    let summary: FieldParseResult<string>
    let period: ParseResult<Period>

    if ('summary' in value) {
      if (typeof value.summary === 'string') {
        summary = value.summary
      } else {
        return {type: 'unsuccessfulParse', summary: 'Summary must be a string'}
      }
    } else {
      return {type: 'unsuccessfulParse', summary: 'Summary must be present'}
    }

    if ('period' in value) {
      period = Period.parse(value.period)

      if (isUnsuccessfulParse(period)) {
        return {type: 'unsuccessfulParse', period: `Period is invalid. ${period.failure}`}
      }
    } else {
      return {type: 'unsuccessfulParse', period: 'Period must be present'}
    }

    return new Employment({summary, period})
  }

  constructor({summary, period}: {summary: string; period: Period}) {
    this.summary = summary
    this.period = period
  }
}

export class Period {
  static parse(value: unknown): ParseResult<Period> {
    if (value === null || value === undefined || !isObject(value))
      return {type: 'unsuccessfulParse', failure: 'Period must be an object'}

    if (!('from' in value)) {
      return {type: 'unsuccessfulParse', failure: 'Period must hava a "from" value'}
    }

    if (!('to' in value)) {
      return {type: 'unsuccessfulParse', failure: 'Period must hava a "to" value'}
    }

    const from = MonthAndYear.parse(value.from)
    const to = MonthAndYear.parse(value.to)

    if (from === null) return {type: 'unsuccessfulParse', failure: 'Period "from" must be present'}
    if (isUnsuccessfulParse(from)) return {type: 'unsuccessfulParse', failure: 'Period has an invalid "from" value'}
    if (isUnsuccessfulParse(to)) return {type: 'unsuccessfulParse', failure: 'Period has an invalid "to" value'}

    return new Period(from, to)
  }

  constructor(public from: MonthAndYear, public to: MonthAndYear | null) {}
}

function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object'
}

export function isUnsuccessfulParse<T>(value: unknown): value is UnsuccessfulParse<T> {
  return value !== null && typeof value === 'object' && 'type' in value && value.type === 'unsuccessfulParse'
}
