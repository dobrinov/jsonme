import React, { ReactNode } from "react";
import { addProtocol, monthAndYearToString } from "../utils";
import { Blank } from "./Blank";
import { Period } from "./Resume";

export function Timeline({
  startingYear,
  children,
  newEventButton,
}: {
  startingYear: number;
  children: ReactNode;
  newEventButton: { title: string; description: string; onClick: () => void };
}) {
  return (
    <div className="timeline">
      <aside>present</aside>
      <div>
        <ul>
          {children}
          <li>
            <div className="timeline__event__summary">
              <aside className="timeline__dot timeline__dot--gray timeline__dot--center" />
              <Blank
                title={newEventButton.title}
                description={newEventButton.description}
                onClick={newEventButton.onClick}
                style="compact"
              />
            </div>
          </li>
        </ul>
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
        <aside className="timeline__dot" />
        {website && (
          <a href={website} target="_blank" rel="nofollow">
            {website}
          </a>
        )}
        <div className="timeline__period">{`${from} - ${to}`}</div>
      </div>
      <div className={`timeline__event__details ${className}`}>{children}</div>
    </li>
  );
}
