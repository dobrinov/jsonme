import classnames from "classnames";
import React, { ReactNode } from "react";

export function Section({
  title,
  subtitle,
  blank,
  children,
}: {
  title: string;
  subtitle?: string;
  blank?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classnames("section", {
        "section--blank": blank,
      })}
    >
      <h2 className="section__heading">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
