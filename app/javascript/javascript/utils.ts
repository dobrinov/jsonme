export function startingYear(temporals: { period: { from: string } }[]) {
  return Math.min(
    ...temporals.map((temporal) => parseInt(temporal.period.from.split("-")[1]))
  );
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
