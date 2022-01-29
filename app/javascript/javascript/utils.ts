import { Period } from "./time";

export function startingYear(temporals: { period: Period }[]) {
  return Math.min(...temporals.map((temporal) => temporal.period.from.year));
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isNotNullOrUndefined<T extends Object>(
  input: null | undefined | T
): input is T {
  return input !== null && input !== undefined;
}
