export class MonthAndYear {
  month: number
  year: number

  static parse(value: string) {
    try {
      const [year, month] = value.split('-')

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
    return new Date(this.toString())
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
