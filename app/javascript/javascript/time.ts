export class MonthAndYear {
  month: number;
  year: number;

  static parse(value: string) {
    const date = new Date(value);

    return new MonthAndYear(date.getFullYear(), date.getMonth() + 1);
  }

  static current() {
    const date = new Date();

    return new MonthAndYear(date.getFullYear(), date.getMonth() + 1);
  }

  constructor(year: number, month: number) {
    this.month = month;
    this.year = year;
  }

  toDate(): Date {
    return new Date(this.toString());
  }

  toString(): string {
    return `${this.year}-${String(this.month).padStart(2, "0")}`;
  }

  toFormattedString(): string {
    return this.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }
}

export class Period {
  from: MonthAndYear;
  to: MonthAndYear | null;

  static parse(from: string, to: string) {
    return new Period(MonthAndYear.parse(from), MonthAndYear.parse(to));
  }

  constructor(from: MonthAndYear, to: MonthAndYear | null) {
    this.from = from;
    this.to = to;
  }

  toString(): string {
    return `${this.from.toFormattedString()} - ${
      this.to !== null ? this.to.toFormattedString() : "Present"
    }`;
  }
}
