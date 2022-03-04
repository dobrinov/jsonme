import { Period } from "./resume/Resume";

export function startingYear(temporals: { period: Period }[]) {
  return Math.min(...temporals.map((temporal) => temporal.period.from.year));
}

export function monthAndYearToString(value: string | null | undefined) {
  if (!value) return null;

  const [month, year] = value.split("-");

  return new Date(`${month}-1-${year}`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isNotNullOrUndefined<T extends Object>(
  input: null | undefined | T
): input is T {
  return input !== null && input !== undefined;
}

export function addProtocol(url: string) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = "https://" + url;
  }

  return url;
}
