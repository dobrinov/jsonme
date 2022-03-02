import classnames from "classnames";
import React, { ReactNode } from "react";
import { EmptyCollectionButton } from "./EmptyCollectionButton";

export function Section({
  title,
  subtitle,
  isPlaceholder,
  children,
}: {
  title: string;
  subtitle?: string;
  isPlaceholder?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={classnames("section", {
        "section--placeholder": isPlaceholder,
      })}
    >
      <h2 className="section__heading">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
