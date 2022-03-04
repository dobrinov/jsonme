import React, { ReactNode } from "react";
import { addProtocol, monthAndYearToString } from "../utils";
import { Period } from "./Resume";

export function Timeline({
  startingYear,
  children,
}: {
  startingYear: number;
  children: ReactNode;
}) {
  return (
    <div className="timeline">
      <aside>present</aside>
      <div>
        <ul>{children}</ul>
      </div>
      <aside>{startingYear}</aside>
    </div>
  );
}

export function TimelineEvent({
  children,
  title,
  period,
  website: rawWebsite,
  className,
}: {
  title: string;
  period: Period;
  website?: string;
  className?: string;
  children: ReactNode;
}) {
  const from = period.from.toFormattedString();
  const to = period.to !== null ? period.to.toFormattedString() : "Present";
  const website = rawWebsite && addProtocol(rawWebsite);

  return (
    <li>
      <div className="timeline__event__summary">
        <h3>{title}</h3>
        <aside />
        {website && (
          <a href={website} target="_blank" rel="nofollow">
            {website}
          </a>
        )}
        <div>{`${from} - ${to}`}</div>
      </div>
      <div className={`timeline__event__details ${className}`}>{children}</div>
    </li>
  );
}
